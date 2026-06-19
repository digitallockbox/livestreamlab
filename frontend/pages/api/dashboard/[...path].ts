import type { NextApiRequest, NextApiResponse } from "next";
import { dashboardRouteHandler } from "../../../src/dashboard/api/routes/dashboardRoutes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return dashboardRouteHandler(req, res);
}
