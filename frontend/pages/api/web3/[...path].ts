import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToUpstream } from "../_upstream";

function isAllowedWeb3Path(path: string): boolean {
    return path === "name/my";
}

export default async function web3ProxyHandler(req: NextApiRequest, res: NextApiResponse) {
    return proxyToUpstream({
        req,
        res,
        allowedMethods: ["GET"],
        isAllowedPath: isAllowedWeb3Path,
        mapPath: (path) => `web3/${path}`,
    });
}
