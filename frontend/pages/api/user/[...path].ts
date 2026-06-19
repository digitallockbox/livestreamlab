import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToUpstream } from "../_upstream";

function isAllowedUserPath(path: string): boolean {
    return path === "profile/me";
}

export default async function userProxyHandler(req: NextApiRequest, res: NextApiResponse) {
    return proxyToUpstream({
        req,
        res,
        allowedMethods: ["PATCH"],
        isAllowedPath: isAllowedUserPath,
        mapPath: (path) => `user/${path}`,
    });
}
