const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.livestreamlab.live";
let runtimeJwt = "";

export function setDashboardApiToken(token) {
  runtimeJwt = token || "";
}

function authHeaders() {
  return {
    ...(runtimeJwt ? { Authorization: `Bearer ${runtimeJwt}` } : {}),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function safeGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function safePost(path, body = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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
