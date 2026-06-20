import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getSession, saveSession } from "../src/dashboard/shared/utils/session";

const providers = [
  { id: "google", label: "Google" },
  { id: "twitch", label: "Twitch" },
  { id: "x", label: "X" },
  { id: "youtube", label: "YouTube" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/callback`;
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    if (!session.onboardingComplete) {
      router.replace("/account/onboarding");
      return;
    }

    router.replace(session.role === "admin" ? "/dashboard/home" : "/creator-dashboard");
  }, [router]);

  function signIn(provider: (typeof providers)[number]["id"]) {
    if (!providerId.trim()) {
      setError("Enter your provider user ID to continue.");
      return;
    }

    if (!callbackUrl) return;
    setError("");
    const start =
      `/api/auth/${provider}/start` +
      `?providerId=${encodeURIComponent(providerId.trim())}` +
      `&name=${encodeURIComponent(displayName.trim())}` +
      `&redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = start;
  }

  async function signInPhantom() {
    const walletAddress = window.prompt("Enter Phantom wallet address");
    if (!walletAddress) return;

    const res = await fetch("/api/auth/phantom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, name: "Phantom User" }),
    });

    if (!res.ok) {
      alert("Phantom login failed");
      return;
    }

    const payload = await res.json();
    const target = `/auth/callback?token=${encodeURIComponent(payload.token)}`;
    window.location.href = target;
  }

  async function submitCredentials() {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required for credentials auth.");
      return;
    }

    setLoadingCredentials(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.message || payload?.error || `${authMode} failed`);
        setLoadingCredentials(false);
        return;
      }

      const token = payload?.accessToken || payload?.token;
      if (!token) {
        setError("No access token received from auth response.");
        setLoadingCredentials(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sessionRes.ok) {
        setError("Session verification failed after credentials auth.");
        setLoadingCredentials(false);
        return;
      }

      const sessionPayload = await sessionRes.json();
      const user = sessionPayload?.user || sessionPayload;
      const role: "admin" | "creator" = user?.role === "admin" ? "admin" : "creator";

      const session = {
        token,
        userId: String(user?.id || user?.userId || user?.email || email),
        role,
        provider: "google" as const,
        providerId: String(user?.id || user?.providerId || user?.email || email),
        name: user?.name || user?.displayName || displayName || email,
        displayName: user?.displayName || user?.name || displayName || email,
        avatar: user?.avatar || null,
        bio: user?.bio || "",
        timezone: user?.timezone || "UTC",
        onboardingComplete: Boolean(user?.onboardingComplete),
      };

      saveSession(session);
      const nextRoute = session.onboardingComplete
        ? session.role === "admin"
          ? "/dashboard/home"
          : "/creator-dashboard"
        : "/account/onboarding";
      router.replace(nextRoute);
    } catch {
      setError("Credentials auth failed due to network error.");
    } finally {
      setLoadingCredentials(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Only founder IDs get admin role. Everyone else becomes creator.</p>
      <p>Supported platforms: Google, Twitch, X, YouTube, and Phantom.</p>
      <div className="card">
        <h2>Credentials Auth</h2>
        <p>
          <button
            onClick={() => setAuthMode("login")}
            disabled={loadingCredentials || authMode === "login"}
          >
            Login
          </button>{" "}
          <button
            onClick={() => setAuthMode("register")}
            disabled={loadingCredentials || authMode === "register"}
          >
            Register
          </button>
        </p>
        <p>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </p>
        <p>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
        </p>
        <p>
          <button onClick={submitCredentials} disabled={loadingCredentials}>
            {loadingCredentials
              ? "Submitting..."
              : authMode === "login"
                ? "Login with Email"
                : "Register with Email"}
          </button>
        </p>

        <hr />
        <h2>Provider Auth</h2>
        <p>
          <label htmlFor="provider-id">Provider User ID</label>
          <br />
          <input
            id="provider-id"
            value={providerId}
            onChange={(event) => setProviderId(event.target.value)}
            placeholder="Enter your Google/Twitch/X/YouTube/Phantom ID"
          />
        </p>
        <p>
          <label htmlFor="display-name">Display Name (optional)</label>
          <br />
          <input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="How your name should appear"
          />
        </p>
        {error ? <p>{error}</p> : null}
        {providers.map((provider) => (
          <p key={provider.id}>
            <button onClick={() => signIn(provider.id)}>{provider.label}</button>
          </p>
        ))}
        <p>
          <button onClick={signInPhantom}>Phantom Wallet</button>
        </p>
      </div>
    </main>
  );
}
