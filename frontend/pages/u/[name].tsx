import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { backendOrigin } from "../../src/dashboard/shared/utils/session";

type Profile = {
  name: string;
  domain: string;
  identity: string;
  ownerUserId: string;
  walletAddress: string | null;
  role: "admin" | "creator";
  purchasedAt: string;
};

export default function PublicProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryName = router.query.name;
    if (!router.isReady || typeof queryName !== "string") return;

    fetch(`${backendOrigin()}/web3/name/profile/${encodeURIComponent(queryName)}`)
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({ error: "Name not found" }));
          throw new Error(payload.error || "Name not found");
        }
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((e) => setError(e.message || "Unable to load profile"));
  }, [router.isReady, router.query.name]);

  if (error) {
    return (
      <main>
        <h1>Creator Profile</h1>
        <div className="card">{error}</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <h1>Creator Profile</h1>
        <div className="card">Loading profile...</div>
      </main>
    );
  }

  return (
    <main>
      <h1>{profile.domain}</h1>
      <div className="card">
        <p>Identity: {profile.identity}</p>
        <p>Role: {profile.role}</p>
        <p>Joined: {new Date(profile.purchasedAt).toLocaleString()}</p>
        <p>Wallet: {profile.walletAddress || "N/A"}</p>
      </div>
    </main>
  );
}
