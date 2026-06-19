import type { NextApiRequest, NextApiResponse } from "next";
import { dashboardProxyController } from "../controllers/dashboardProxyController";

export async function dashboardRouteHandler(req: NextApiRequest, res: NextApiResponse) {
    const pathSegments = Array.isArray(req.query.path) ? req.query.path : [];
    const routePath = pathSegments.join("/");

    if (!routePath) {
        return res.status(404).json({ error: "Unknown dashboard endpoint" });
    }

    return dashboardProxyController(req, res, routePath);
}
