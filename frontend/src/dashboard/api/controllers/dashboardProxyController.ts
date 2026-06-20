import type { NextApiRequest, NextApiResponse } from "next";
import { proxyDashboardRequest } from "../services/dashboardProxyService";

function extractQueryWithoutPath(req: NextApiRequest): URLSearchParams {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
        if (key === "path") continue;

        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item));
            continue;
        }

        if (typeof value === "string") {
            query.append(key, value);
        }
    }

    return query;
}

export async function dashboardProxyController(req: NextApiRequest, res: NextApiResponse, routePath: string) {
    if (req.method !== "GET" && req.method !== "POST" && req.method !== "PATCH" && req.method !== "DELETE") {
        res.setHeader("Allow", "GET, POST, PATCH, DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const method = req.method as "GET" | "POST" | "PATCH" | "DELETE";

    try {
        const result = await proxyDashboardRequest({
            routePath,
            method,
            query: extractQueryWithoutPath(req),
            incomingAuth: req.headers.authorization,
            body: req.body,
        });

        return res.status(result.status).json(result.payload);
    } catch {
        return res.status(502).json({ error: "Dashboard upstream unavailable" });
    }
}
