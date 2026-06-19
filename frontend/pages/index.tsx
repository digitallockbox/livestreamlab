import Link from "next/link";
import { useMemo } from "react";
import { getSession } from "../src/dashboard/shared/utils/session";

export default function IndexPage() {
  const target = useMemo(() => {
    if (typeof window === "undefined") return null;
    const session = getSession();
    if (!session) return null;
    if (!session.onboardingComplete) return "/account/onboarding";
    return session.role === "admin" ? "/dashboard/home" : "/creator-dashboard";
  }, []);

  return (
    <main>
      <h1>LiveStreamLab Frontend</h1>
      <p>Sign in to access your dashboard.</p>
      <div className="card">
        <p>
          <Link href="/login">Login</Link>
        </p>
        <p>
          <Link href="/account/onboarding">Account Setup</Link>
        </p>
        {target ? (
          <p>
            <Link href={target}>Continue to Dashboard</Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
