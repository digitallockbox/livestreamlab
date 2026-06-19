import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/home");
  }, [router]);

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Redirecting to your home dashboard...</p>
    </main>
  );
}
