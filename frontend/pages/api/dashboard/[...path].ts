import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_UPSTREAM_BASE = "https://api.livestreamlab.live";

const ALLOWED_ENDPOINTS = new Set([
    "system/health",
    "system/enginesHealth",
    "analytics/overview",
    "analytics/streamAnalytics",
    "analytics/contentAnalytics",
    "tenant/creators",
    "system/engines/activate",
    "system/engines/bootLogs",
]);

function getUpstreamConfig() {
    const baseUrl = process.env.DASHBOARD_API_BASE_URL || DEFAULT_UPSTREAM_BASE;
    const token = process.env.DASHBOARD_API_TOKEN || "";

    return { baseUrl, token };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const pathSegments = Array.isArray(req.query.path) ? req.query.path : [];
    const routePath = pathSegments.join("/");

    if (!ALLOWED_ENDPOINTS.has(routePath)) {
        return res.status(404).json({ error: "Unknown dashboard endpoint" });
    }

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { baseUrl, token } = getUpstreamConfig();
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
        if (key === "path") continue;
        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item));
        } else if (typeof value === "string") {
            query.append(key, value);
        }
    }
    const queryString = query.toString();
    const targetUrl = `${baseUrl.replace(/\/$/, "")}/${routePath}${queryString ? `?${queryString}` : ""}`;

    try {
        const upstream = await fetch(targetUrl, {
            method: req.method,
            headers: {
                ...(req.method === "POST" ? { "Content-Type": "application/json" } : {}),
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
        });

        const contentType = upstream.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await upstream.json()
            : { data: await upstream.text() };

        return res.status(upstream.status).json(payload);
    } catch {
        return res.status(502).json({ error: "Dashboard upstream unavailable" });
    }
}
