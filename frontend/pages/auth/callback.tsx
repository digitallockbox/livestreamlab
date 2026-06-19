import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { saveSession } from "../../src/dashboard/shared/utils/session";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    async function complete() {
      const token = router.query.token;
      if (!token || typeof token !== "string") {
        setMessage("Missing token. Please login again.");
        return;
      }

      const res = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setMessage("Session verification failed. Please login again.");
        return;
      }

      const session = await res.json();
      saveSession({ ...session, token });

      const nextRoute = session.onboardingComplete
        ? session.role === "admin"
          ? "/dashboard/home"
          : "/creator-dashboard"
        : "/account/onboarding";

      router.replace(nextRoute);
    }

    if (router.isReady) {
      complete();
    }
  }, [router]);

  return (
    <main>
      <h1>Auth Callback</h1>
      <p>{message}</p>
    </main>
  );
}
