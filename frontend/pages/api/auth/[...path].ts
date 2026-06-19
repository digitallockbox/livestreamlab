import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToUpstream } from "../_upstream";

const AUTH_PROVIDER_START = /^(google|twitch|x|youtube)\/start$/;

function isAllowedAuthPath(path: string): boolean {
    return path === "session" || path === "phantom" || AUTH_PROVIDER_START.test(path);
}

export default async function authProxyHandler(req: NextApiRequest, res: NextApiResponse) {
    return proxyToUpstream({
        req,
        res,
        allowedMethods: ["GET", "POST"],
        isAllowedPath: isAllowedAuthPath,
        mapPath: (path) => `auth/${path}`,
    });
}
