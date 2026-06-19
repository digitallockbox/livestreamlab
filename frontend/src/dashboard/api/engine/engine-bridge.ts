const BASE_URL = "/api/dashboard";

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
      headers: defaultHeaders(),
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
