const BASE_URL = "/api/dashboard";

export type DashboardApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

function defaultHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function safeGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: defaultHeaders(),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: payload?.error || `Request failed with status ${res.status}`,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: payload,
      error: null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Network error while contacting dashboard API",
    };
  }
}

async function safePost(path, body = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: payload?.error || `Request failed with status ${res.status}`,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: payload,
      error: null,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Network error while contacting dashboard API",
    };
  }
}

export const getSystemHealth = () => safeGet("/system/health");
export const getEngineHealth = () => safeGet("/system/enginesHealth");
export const getOverviewAnalytics = () => safeGet("/analytics/overview");
export const getStreamAnalytics = () => safeGet("/analytics/streamAnalytics");
export const getContentAnalytics = () => safeGet("/analytics/contentAnalytics");
export const getCreators = () => safeGet("/tenant/creators");
export const activateEngine = () => safePost("/system/engines/activate");
export const getBootLogs = () => safeGet("/system/engines/bootLogs");
