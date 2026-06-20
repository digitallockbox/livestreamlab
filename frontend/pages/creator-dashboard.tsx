import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGate from "../src/dashboard/shared/ui/RoleGate";
import { getSession } from "../src/dashboard/shared/utils/session";
import BadgeRow from "../src/components/BadgeRow";
import CreatorNFTs from "../src/components/CreatorNFTs";
import CreatorPhotos from "../src/components/CreatorPhotos";
import ProfileMediaEditor from "../src/components/ProfileMediaEditor";
import { useCreatorBadges } from "../src/hooks/useCreatorBadges";

type NameSummary = {
  hasName?: boolean;
  domain?: string | null;
  identity?: string | null;
  profileUrl?: string | null;
  balance?: number;
  price?: number;
};

export default function CreatorDashboardPage() {
  const [nameSummary, setNameSummary] = useState<NameSummary | null>(null);
  const session = getSession();
  const creatorId = session?.ownedName || session?.web3Domain || "current";
  const { badges } = useCreatorBadges(creatorId);

  useEffect(() => {
    if (!session?.token) return;

    fetch("/api/web3/name/my", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => res.json())
      .then((data) => setNameSummary(data))
      .catch(() => null);
  }, [session?.token]);

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-6 text-white">
        <section className="rounded border border-gray-700 bg-gray-900/60 p-4">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <p>You are logged in as creator.</p>
          {nameSummary?.hasName ? (
            <>
              <p>Identity: {nameSummary.identity}</p>
              <p>Domain: {nameSummary.domain}</p>
              <p>
                Profile:{" "}
                <Link href={nameSummary.profileUrl || "/creator/buy-name"}>
                  {nameSummary.profileUrl || "/creator/buy-name"}
                </Link>
              </p>
              <p>STREAMING Balance: {nameSummary.balance}</p>
            </>
          ) : (
            <p>No .livestreamlab name yet. Mint one to get your public identity.</p>
          )}
          <BadgeRow badges={badges} />
          <p>
            <Link href="/dashboard/go-live">Go Live</Link>
          </p>
          <p>
            <Link href="/dashboard/content">Content</Link>
          </p>
          <p>
            <Link href="/dashboard/monetization">Monetization</Link>
          </p>
          <p>
            <Link href="/dashboard/messages">Messages</Link>
          </p>
          <p>
            <Link href="/dashboard/notifications">Notifications</Link>
          </p>
          <p>
            <Link href="/dashboard/settings">Settings and Vault</Link>
          </p>
          {session?.role === "admin" ? (
            <p>
              <Link href="/dashboard/admin">Admin Panel</Link>
            </p>
          ) : null}
          <p>
            <Link href="/creator/buy-name">Buy .livestreamlab Name</Link>
          </p>
        </section>

        <ProfileMediaEditor />
        <CreatorPhotos creatorId={creatorId} />
        <CreatorNFTs creatorId={creatorId} />
      </main>
    </RoleGate>
  );
}
