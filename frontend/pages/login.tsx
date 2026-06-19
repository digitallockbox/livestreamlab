import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "../src/dashboard/shared/utils/session";

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

  return (
    <main>
      <h1>Login</h1>
      <p>Only founder IDs get admin role. Everyone else becomes creator.</p>
      <p>Supported platforms: Google, Twitch, X, YouTube, and Phantom.</p>
      <div className="card">
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
