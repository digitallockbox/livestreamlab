import { useEffect, useRef, useState } from "react";
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
  const [saveState, setSaveState] = useState("Idle");
  const [saving, setSaving] = useState(false);
  const session = getSession();
  const hydratedRef = useRef(false);
  const draftHashRef = useRef("");
  const displayNameReady = displayName.trim().length >= 2;
  const bioReady = bio.trim().length > 0;
  const avatarReady = avatar.trim().length > 0;
  const isReadyToFinish = displayNameReady && timezone.trim().length > 0;

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
    hydratedRef.current = true;
    draftHashRef.current = "";
  }, [router, session]);

  useEffect(() => {
    if (!hydratedRef.current || !session?.token) {
      return;
    }

    const draftHash = JSON.stringify({
      displayName: displayName.trim(),
      bio: bio.trim(),
      timezone: timezone.trim(),
      avatar: avatar.trim(),
    });

    if (draftHash === draftHashRef.current) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSaveState("Auto-saving...");
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
            onboardingComplete: false,
          }),
        });

        if (!res.ok) {
          setSaveState("Auto-save failed");
          return;
        }

        const updated = await res.json();
        const refreshedSession = await fetch(`${backendOrigin()}/auth/session`, {
          headers: { Authorization: `Bearer ${session.token}` },
        }).then((result) => result.json());

        saveSession({ ...refreshedSession, token: session.token });
        draftHashRef.current = draftHash;
        setSaveState(updated.onboardingComplete ? "Saved" : "Auto-saved");
      } catch {
        setSaveState("Auto-save failed");
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [avatar, bio, displayName, session?.token, timezone]);

  async function completeSetup() {
    if (!session?.token) {
      router.replace("/login");
      return;
    }

    if (!displayNameReady || !timezone.trim()) {
      setMessage("Add at least a display name and timezone before continuing.");
      return;
    }

    setSaving(true);
    setMessage("Saving account setup...");
    setSaveState("Saving...");

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
    draftHashRef.current = JSON.stringify({
      displayName: displayName.trim(),
      bio: bio.trim(),
      timezone: timezone.trim(),
      avatar: avatar.trim(),
    });

    if (!updated.ownedName) {
      setMessage("Setup complete. Next, buy your .livestreamlab name.");
      router.replace("/creator/buy-name");
      return;
    }

    setMessage("Setup complete. Redirecting to dashboard...");
    setSaveState("Saved");
    router.replace(session.role === "admin" ? "/dashboard/home" : "/creator-dashboard");
    setSaving(false);
  }

  return (
    <main>
      <h1>Account Setup</h1>
      <p>Finish your profile before entering the dashboard.</p>
      <div className="card">
        <p>
          Step 1 of 3: Complete your creator profile, then mint your identity name, then enter the
          dashboard.
        </p>

        <div className="rounded border border-gray-700 bg-gray-950/50 p-4 mb-4">
          <p className="font-semibold">1. Profile Basics</p>
          <p className="text-sm text-gray-300">
            This is what viewers and your team will see first.
          </p>
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
        </div>

        <div className="rounded border border-gray-700 bg-gray-950/50 p-4 mb-4">
          <p className="font-semibold">2. Identity Preferences</p>
          <p className="text-sm text-gray-300">
            These settings power your creator identity and public profile.
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
        </div>

        <div className="rounded border border-gray-700 bg-gray-950/50 p-4 mb-4">
          <p className="font-semibold">3. Next Step</p>
          <p className="text-sm text-gray-300">
            Mint or buy your .livestreamlab name after setup to lock your public identity.
          </p>
          <p>
            <Link href="/creator/buy-name">Go to Buy Name</Link>
          </p>
        </div>

        <p>{message}</p>
        <p className="text-sm text-gray-300">{saveState}</p>
        <p className="text-sm text-gray-300">
          Ready status: {displayNameReady ? "display name set" : "display name missing"},{" "}
          {bioReady ? "bio set" : "bio optional"}, {avatarReady ? "avatar set" : "avatar optional"},
          timezone {timezone ? "set" : "missing"}.
        </p>
        <p>
          <button onClick={completeSetup} disabled={saving || !isReadyToFinish}>
            {saving
              ? "Saving..."
              : isReadyToFinish
                ? "Complete Setup"
                : "Enter required fields first"}
          </button>
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
