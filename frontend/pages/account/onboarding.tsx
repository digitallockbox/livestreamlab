import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  backendOrigin,
  clearSession,
  getSession,
  saveSession,
} from "../../src/dashboard/shared/utils/session";

export default function AccountOnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("Complete your account setup to continue.");
  const [saving, setSaving] = useState(false);
  const session = getSession();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.onboardingComplete) {
      router.replace(session.role === "admin" ? "/dashboard/home" : "/creator-dashboard");
      return;
    }

    setDisplayName(session.displayName || session.name || "");
    setBio(session.bio || "");
    setTimezone(session.timezone || "UTC");
    setAvatar(session.avatar || "");
  }, [router, session]);

  async function completeSetup() {
    if (!session?.token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setMessage("Saving account setup...");

    const res = await fetch(`${backendOrigin()}/user/profile/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        displayName: displayName.trim(),
        bio: bio.trim(),
        timezone,
        avatar: avatar.trim() || null,
        onboardingComplete: true,
      }),
    });

    if (!res.ok) {
      setMessage("Unable to save setup. Please try again.");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    const refreshedSession = await fetch(`${backendOrigin()}/auth/session`, {
      headers: { Authorization: `Bearer ${session.token}` },
    }).then((result) => result.json());

    saveSession({ ...refreshedSession, token: session.token });

    if (!updated.ownedName) {
      setMessage("Setup complete. Next, buy your .livestreamlab name.");
      router.replace("/creator/buy-name");
      return;
    }

    setMessage("Setup complete. Redirecting to dashboard...");
    router.replace(session.role === "admin" ? "/dashboard/home" : "/creator-dashboard");
    setSaving(false);
  }

  return (
    <main>
      <h1>Account Setup</h1>
      <p>Finish your profile before entering the dashboard.</p>
      <div className="card">
        <p>
          <label htmlFor="displayName">Display Name</label>
          <br />
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Anthony"
          />
        </p>
        <p>
          <label htmlFor="bio">Bio</label>
          <br />
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell viewers who you are."
          />
        </p>
        <p>
          <label htmlFor="timezone">Timezone</label>
          <br />
          <input
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="UTC"
          />
        </p>
        <p>
          <label htmlFor="avatar">Avatar URL</label>
          <br />
          <input
            id="avatar"
            value={avatar}
            onChange={(event) => setAvatar(event.target.value)}
            placeholder="https://..."
          />
        </p>
        <p>{message}</p>
        <p>
          <button onClick={completeSetup} disabled={saving}>
            {saving ? "Saving..." : "Complete Setup"}
          </button>
        </p>
        <p>
          <Link href="/creator/buy-name">Skip to buy name</Link>
        </p>
        <p>
          <button
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </p>
      </div>
    </main>
  );
}
