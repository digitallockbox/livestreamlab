const ALLOWED_ENDPOINTS = new Set([
    "system/health",
    "system/enginesHealth",
    "analytics/overview",
    "analytics/streamAnalytics",
    "analytics/contentAnalytics",
    "tenant/creators",
    "creator/stats",
    "creator/earnings",
    "creator/streams",
    "system/engines/activate",
    "system/engines/bootLogs",
    "creator/current/photos",
    "creator/current/photos/upload",
    "creator/current/nfts",
    "creator/current/badges",
    "creator/profile/media",
    "creator/vault",
    "creator/vault/upload",
    "creator/vault/delete",
    "store/products",
    "store/create",
    "store/update",
    "store/delete",
    "store/upload-image",
    "stream/start",
    "stream/status",
    "stream/end",
    "messages/thread",
    "messages/send",
    "messages/read",
    "notifications",
    "admin/users",
    "admin/streams",
    "admin/products",
    "admin/users/ban",
    "admin/content/remove",
    "nft/mint",
]);

export function isAllowedDashboardEndpoint(routePath: string): boolean {
    if (ALLOWED_ENDPOINTS.has(routePath)) {
        return true;
    }

    return (
        /^creator\/[^/]+\/photos(?:\/upload)?$/.test(routePath) ||
        /^creator\/[^/]+\/nfts$/.test(routePath) ||
        /^creator\/[^/]+\/badges$/.test(routePath)
    );
}

export function buildDashboardTargetUrl(baseUrl: string, routePath: string, query: URLSearchParams): string {
    const queryString = query.toString();
    return `${baseUrl.replace(/\/$/, "")}/${routePath}${queryString ? `?${queryString}` : ""}`;
}

export async function forwardDashboardRequest(params: {
    targetUrl: string;
    method: "GET" | "POST" | "PATCH" | "DELETE";
    incomingAuth?: string;
    fallbackToken?: string;
    body?: unknown;
}): Promise<{ status: number; payload: unknown }> {
    const { targetUrl, method, incomingAuth, fallbackToken, body } = params;
    const hasJsonBody = method !== "GET" && method !== "DELETE";

    const upstream = await fetch(targetUrl, {
        method,
        headers: {
            ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
            Accept: "application/json",
            ...(incomingAuth
                ? { Authorization: incomingAuth }
                : fallbackToken
                    ? { Authorization: `Bearer ${fallbackToken}` }
                    : {}),
        },
        body: hasJsonBody ? JSON.stringify(body || {}) : undefined,
    });

    const contentType = upstream.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await upstream.json()
        : { data: await upstream.text() };

    return {
        status: upstream.status,
        payload,
    };
}
