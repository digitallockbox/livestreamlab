import Link from "next/link";
import { useRouter } from "next/router";
import { clearSession, getSession } from "../utils/session";

export default function DashboardTopBar() {
  const router = useRouter();
  const session = getSession();
  const setupComplete = Boolean(session?.onboardingComplete);
  const identityLabel =
    session?.web3Domain || session?.ownedName || session?.displayName || session?.name || "Guest";

  return (
    <header className="mb-6 rounded border border-gray-700 bg-gray-950/80 p-4 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LiveStreamLab</p>
          <h2 className="text-lg font-semibold">{identityLabel}</h2>
          <p className="text-sm text-gray-300">
            {session?.emailIdentity
              ? `${session.emailIdentity}`
              : "Complete setup to lock your identity."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`rounded-full px-3 py-1 font-semibold ${setupComplete ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
          >
            {setupComplete ? "Setup complete" : "Setup required"}
          </span>
          <Link
            className="rounded border border-gray-600 px-3 py-1 text-gray-200 hover:border-white"
            href="/account/onboarding"
          >
            Account Setup
          </Link>
          <Link
            className="rounded border border-gray-600 px-3 py-1 text-gray-200 hover:border-white"
            href="/creator/buy-name"
          >
            Buy Name
          </Link>
          <button
            className="rounded border border-gray-600 px-3 py-1 text-gray-200 hover:border-white"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
