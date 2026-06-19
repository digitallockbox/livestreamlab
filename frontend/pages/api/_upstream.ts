import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_UPSTREAM_BASE = "https://api.livestreamlab.live";
const LOCAL_UPSTREAM_BASE = "http://localhost:4000";

type ProxyOptions = {
    req: NextApiRequest;
    res: NextApiResponse;
    allowedMethods: Array<"GET" | "POST" | "PATCH">;
    isAllowedPath: (path: string) => boolean;
    mapPath?: (path: string) => string;
};

function upstreamBase(): string {
    return (
        process.env.DASHBOARD_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
        (process.env.NODE_ENV === "development" ? LOCAL_UPSTREAM_BASE : DEFAULT_UPSTREAM_BASE)
    );
}

function toPath(req: NextApiRequest): string {
    const segments = Array.isArray(req.query.path) ? req.query.path : [];
    return segments.join("/");
}

function toQuery(req: NextApiRequest): URLSearchParams {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
        if (key === "path") continue;

        if (Array.isArray(value)) {
            for (const item of value) query.append(key, item);
            continue;
        }

        if (typeof value === "string") {
            query.append(key, value);
        }
    }

    return query;
}

function buildTargetUrl(path: string, query: URLSearchParams): string {
    const base = upstreamBase().replace(/\/$/, "");
    const queryString = query.toString();
    return `${base}/${path}${queryString ? `?${queryString}` : ""}`;
}

function outboundHeaders(req: NextApiRequest, method: string): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    const auth = req.headers.authorization;
    if (typeof auth === "string" && auth) {
        headers.Authorization = auth;
    }

    if (method === "POST" || method === "PATCH") {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

async function responsePayload(upstream: Response): Promise<unknown> {
    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return upstream.json();
    }
    return { data: await upstream.text() };
}

export async function proxyToUpstream(options: ProxyOptions) {
    const { req, res, allowedMethods, isAllowedPath, mapPath = (path) => path } = options;

    if (!req.method || !allowedMethods.includes(req.method as "GET" | "POST" | "PATCH")) {
        res.setHeader("Allow", allowedMethods.join(", "));
        return res.status(405).json({ error: "Method not allowed" });
    }

    const path = toPath(req);
    if (!path || !isAllowedPath(path)) {
        return res.status(404).json({ error: "Unknown endpoint" });
    }

    const targetUrl = buildTargetUrl(mapPath(path), toQuery(req));

    try {
        const method = req.method as "GET" | "POST" | "PATCH";
        const upstream = await fetch(targetUrl, {
            method,
            headers: outboundHeaders(req, method),
            body: method === "GET" ? undefined : JSON.stringify(req.body || {}),
            redirect: "manual",
        });

        if (upstream.status >= 300 && upstream.status < 400) {
            const location = upstream.headers.get("location");
            if (location) {
                res.setHeader("Location", location);
            }
            return res.status(upstream.status).end();
        }

        const payload = await responsePayload(upstream);
        return res.status(upstream.status).json(payload);
    } catch {
        return res.status(502).json({ error: "Upstream unavailable" });
    }
}
