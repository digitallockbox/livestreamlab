import Link from "next/link";
import RoleGate from "../src/dashboard/shared/ui/RoleGate";

export default function CreatorDashboardPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Creator Dashboard</h1>
        <div className="card">
          <p>You are logged in as creator.</p>
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
