import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getSession, type SessionPayload } from "../utils/session";
import DashboardTopBar from "./DashboardTopBar";

type Props = {
  requiredRoles: Array<"admin" | "creator">;
  children: ReactNode;
};

export default function RoleGate({ requiredRoles, children }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const allowedRoles = useMemo(() => new Set(requiredRoles), [requiredRoles]);

  function replaceIfNeeded(target: string) {
    const currentPath = router.asPath.split("?")[0];
    if (currentPath !== target) {
      router.replace(target);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    const current = getSession();
    setSession(current);

    if (!current) {
      replaceIfNeeded("/login");
      return;
    }

    if (!allowedRoles.has(current.role)) {
      const fallback = current.role === "admin" ? "/dashboard/home" : "/creator-dashboard";
      replaceIfNeeded(fallback);
      return;
    }

    if (!current.onboardingComplete) {
      replaceIfNeeded("/account/onboarding");
      return;
    }

    setLoading(false);
  }, [allowedRoles, router]);

  if (loading || !session) {
    return <main>Authorizing...</main>;
  }

  return (
    <div className="p-6">
      <DashboardTopBar />
      {children}
    </div>
  );
}
