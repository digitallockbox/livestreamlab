import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGate from "../src/dashboard/shared/ui/RoleGate";
import { backendOrigin, getSession } from "../src/dashboard/shared/utils/session";

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

  useEffect(() => {
    if (!session?.token) return;

    fetch(`${backendOrigin()}/web3/name/my`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => res.json())
      .then((data) => setNameSummary(data))
      .catch(() => null);
  }, [session?.token]);

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Creator Dashboard</h1>
        <div className="card">
          <p>You are logged in as creator.</p>
          {nameSummary?.hasName ? (
            <>
              <p>Identity: {nameSummary.identity}</p>
              <p>Domain: {nameSummary.domain}</p>
              <p>
                Profile: <Link href={nameSummary.profileUrl || "/creator/buy-name"}>{nameSummary.profileUrl || "/creator/buy-name"}</Link>
              </p>
              <p>STREAMING Balance: {nameSummary.balance}</p>
            </>
          ) : (
            <p>No .livestreamlab name yet. Mint one to get your public identity.</p>
          )}
          <p>
            <Link href="/dashboard/go-live">Go Live</Link>
          </p>
          <p>
            <Link href="/dashboard/content">Content</Link>
          </p>
          <p>
            <Link href="/creator/buy-name">Buy .livestreamlab Name</Link>
          </p>
        </div>
      </main>
    </RoleGate>
  );
}
