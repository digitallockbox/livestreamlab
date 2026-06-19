import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendOrigin, saveSession } from "../../src/dashboard/shared/utils/session";

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

      const res = await fetch(`${backendOrigin()}/auth/session`, {
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

      if (session.role === "admin") {
        router.replace("/dashboard/home");
      } else {
        router.replace("/creator-dashboard");
      }
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
