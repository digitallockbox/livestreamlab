export type SessionPayload = {
  token?: string;
  userId: string;
  role: "admin" | "creator";
  provider: "google" | "twitch" | "x" | "youtube" | "phantom";
  providerId: string;
  name?: string;
  displayName?: string;
  avatar?: string | null;
  bio?: string;
  timezone?: string;
  onboardingComplete?: boolean;
  ownedName?: string | null;
  web3Domain?: string | null;
  emailIdentity?: string | null;
};

const SESSION_KEY = "livestreamlab.session";

export function backendOrigin(): string {
  return process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:4000";
}

export function saveSession(session: SessionPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): SessionPayload | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionToken(): string {
  const session = getSession();
  return session?.token || "";
}
