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

export type StreamControlPayload = {
  title?: string;
  category?: string;
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

async function safeRequest(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: defaultHeaders(),
      body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body || {}),
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

const safeGet = (path: string) => safeRequest("GET", path);
const safePost = (path: string, body = {}) => safeRequest("POST", path, body);
const safePatch = (path: string, body = {}) => safeRequest("PATCH", path, body);
const safeDelete = (path: string) => safeRequest("DELETE", path);

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
export const getCreatorStats = () => safeGet("/creator/stats");
export const getCreatorEarnings = () => safeGet("/creator/earnings");
export const getCreatorStreams = () => safeGet("/creator/streams");
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
export const getStoreProducts = () => safeGet("/store/products");
export const createStoreProduct = (payload: Record<string, unknown>) => safePost("/store/create", payload);
export const updateStoreProduct = (payload: Record<string, unknown>) => safePatch("/store/update", payload);
export const deleteStoreProduct = (id: string) => safePost("/store/delete", { id });
export const uploadStoreProductImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return safeUpload("/store/upload-image", formData);
};
export const startStream = (payload: StreamControlPayload) => safePost("/stream/start", payload);
export const getStreamStatus = () => safeGet("/stream/status");
export const endStream = () => safePost("/stream/end", {});
export const getMessageThread = (threadId: string) => safeGet(`/messages/thread?threadId=${encodeURIComponent(threadId)}`);
export const sendMessage = (payload: { threadId: string; text: string }) => safePost("/messages/send", payload);
export const markMessageThreadRead = (threadId: string) => safePost("/messages/read", { threadId });
export const getNotifications = () => safeGet("/notifications");
export const getVaultItems = () => safeGet("/creator/vault");
export const uploadVaultItem = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return safeUpload("/creator/vault/upload", formData);
};
export const deleteVaultItem = (itemId: string) => safePost("/creator/vault/delete", { itemId });
export const getAdminUsers = () => safeGet("/admin/users");
export const getAdminStreams = () => safeGet("/admin/streams");
export const getAdminProducts = () => safeGet("/admin/products");
export const banAdminUser = (userId: string) => safePost("/admin/users/ban", { userId });
export const removeAdminContent = (contentId: string) => safePost("/admin/content/remove", { contentId });
