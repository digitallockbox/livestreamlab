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

export function isAllowedDashboardEndpoint(routePath: string): boolean {
    return ALLOWED_ENDPOINTS.has(routePath);
}

export function buildDashboardTargetUrl(baseUrl: string, routePath: string, query: URLSearchParams): string {
    const queryString = query.toString();
    return `${baseUrl.replace(/\/$/, "")}/${routePath}${queryString ? `?${queryString}` : ""}`;
}

export async function forwardDashboardRequest(params: {
    targetUrl: string;
    method: "GET" | "POST";
    incomingAuth?: string;
    fallbackToken?: string;
    body?: unknown;
}): Promise<{ status: number; payload: unknown }> {
    const { targetUrl, method, incomingAuth, fallbackToken, body } = params;

    const upstream = await fetch(targetUrl, {
        method,
        headers: {
            ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
            Accept: "application/json",
            ...(incomingAuth
                ? { Authorization: incomingAuth }
                : fallbackToken
                    ? { Authorization: `Bearer ${fallbackToken}` }
                    : {}),
        },
        body: method === "POST" ? JSON.stringify(body || {}) : undefined,
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
