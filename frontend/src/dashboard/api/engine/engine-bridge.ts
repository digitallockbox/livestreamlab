import { getSessionToken } from "../../shared/utils/session";

const BASE_URL = "/api/dashboard";

export type DashboardApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export type Badge = {
  type: string;
  label: string;
  color?: string;
};

export type CreatorPhoto = {
  id?: string;
  url: string;
  title?: string;
};

export type CreatorNft = {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
};

function defaultHeaders() {
  const token = getSessionToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

async function safeUpload(path: string, formData: FormData) {
  try {
    const token = getSessionToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
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
export const getCreatorPhotos = (creatorId: string) => safeGet(`/creator/${creatorId}/photos`);
export const getCreatorNfts = (creatorId: string) => safeGet(`/creator/${creatorId}/nfts`);
export const getCreatorBadges = (creatorId: string) => safeGet(`/creator/${creatorId}/badges`);
export const mintCreatorNft = (payload: {
  creatorId: string;
  name: string;
  image: string;
  description: string;
}) => safePost("/nft/mint", payload);
export const updateProfileMedia = (payload: { bannerUrl?: string; avatarUrl?: string }) =>
  safePost("/creator/profile/media", payload);
export const uploadCreatorPhoto = (creatorId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("creatorId", creatorId);
  return safeUpload(`/creator/${creatorId}/photos/upload`, formData);
};
