import { getSessionToken } from "../dashboard/shared/utils/session";

export type ApiResult<T = unknown> = {
    ok: boolean;
    status: number;
    data: T | null;
    error: string | null;
};

type RequestMethod = "GET" | "POST";

function withAuthHeaders(base: Record<string, string> = {}) {
    const token = getSessionToken();
    return {
        ...base,
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function parsePayload(res: Response) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return res.json().catch(() => null);
    }

    const text = await res.text().catch(() => "");
    return text ? { data: text } : null;
}

async function request<T = unknown>(
    method: RequestMethod,
    path: string,
    body?: unknown,
): Promise<ApiResult<T>> {
    try {
        const res = await fetch(path, {
            method,
            headers: withAuthHeaders(method === "POST" ? { "Content-Type": "application/json" } : {}),
            body: method === "POST" ? JSON.stringify(body || {}) : undefined,
        });

        const payload = await parsePayload(res);
        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                data: null,
                error:
                    (payload as { error?: string } | null)?.error ||
                    `Request failed with status ${res.status}`,
            };
        }

        return {
            ok: true,
            status: res.status,
            data: payload as T,
            error: null,
        };
    } catch {
        return {
            ok: false,
            status: 0,
            data: null,
            error: "Network error",
        };
    }
}

async function upload<T = unknown>(path: string, formData: FormData): Promise<ApiResult<T>> {
    try {
        const res = await fetch(path, {
            method: "POST",
            headers: withAuthHeaders(),
            body: formData,
        });

        const payload = await parsePayload(res);
        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                data: null,
                error:
                    (payload as { error?: string } | null)?.error ||
                    `Request failed with status ${res.status}`,
            };
        }

        return {
            ok: true,
            status: res.status,
            data: payload as T,
            error: null,
        };
    } catch {
        return {
            ok: false,
            status: 0,
            data: null,
            error: "Network error",
        };
    }
}

export const api = {
    get: <T = unknown>(path: string) => request<T>("GET", path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>("POST", path, body),
    upload: <T = unknown>(path: string, formData: FormData) => upload<T>(path, formData),
};
