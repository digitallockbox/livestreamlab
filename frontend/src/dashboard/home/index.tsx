import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "../shared/utils/session";

type NameSummary = {
  hasName?: boolean;
  domain?: string | null;
  identity?: string | null;
  profileUrl?: string | null;
};

export default function Home() {
  const [nameSummary, setNameSummary] = useState<NameSummary | null>(null);
  const session = getSession();

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
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold">LiveStreamLab Dashboard</h1>
      <p className="mt-4 text-gray-300">Welcome to your creator control center.</p>
      <div className="mt-6 rounded border border-gray-700 bg-gray-900 p-4">
        {nameSummary?.hasName ? (
          <>
            <p className="font-semibold">Bound identity</p>
            <p>{nameSummary.identity}</p>
            <p>{nameSummary.domain}</p>
            <p>
              Public profile:{" "}
              <Link href={nameSummary.profileUrl || "/creator/buy-name"}>
                {nameSummary.profileUrl || "/creator/buy-name"}
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">No bound .livestreamlab name yet</p>
            <p>
              <Link href="/creator/buy-name">Buy your identity name</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
