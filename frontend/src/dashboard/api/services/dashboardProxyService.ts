import {
    buildDashboardTargetUrl,
    forwardDashboardRequest,
    isAllowedDashboardEndpoint,
} from "../engines/dashboardEngineFacade";

const DEFAULT_UPSTREAM_BASE = "https://api.livestreamlab.live";
const LOCAL_UPSTREAM_BASE = "http://localhost:4000";

export type DashboardProxyInput = {
    routePath: string;
    method: "GET" | "POST";
    query: URLSearchParams;
    incomingAuth?: string;
    body?: unknown;
};

export type DashboardProxyResult = {
    status: number;
    payload: unknown;
};

function getUpstreamConfig() {
    const baseUrl =
        process.env.DASHBOARD_API_BASE_URL ||
        (process.env.NODE_ENV === "development" ? LOCAL_UPSTREAM_BASE : DEFAULT_UPSTREAM_BASE);
    const token = process.env.DASHBOARD_API_TOKEN || "";

    return { baseUrl, token };
}

export async function proxyDashboardRequest(input: DashboardProxyInput): Promise<DashboardProxyResult> {
    if (!isAllowedDashboardEndpoint(input.routePath)) {
        return {
            status: 404,
            payload: { error: "Unknown dashboard endpoint" },
        };
    }

    const { baseUrl, token } = getUpstreamConfig();
    const targetUrl = buildDashboardTargetUrl(baseUrl, input.routePath, input.query);

    return forwardDashboardRequest({
        targetUrl,
        method: input.method,
        incomingAuth: input.incomingAuth,
        fallbackToken: token,
        body: input.body,
    });
}
