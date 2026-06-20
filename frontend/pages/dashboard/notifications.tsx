import { useState } from "react";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import { getNotifications } from "../../src/dashboard/api/engine/engine-bridge";

export default function NotificationsPage() {
  const [payload, setPayload] = useState<unknown>(null);
  const [status, setStatus] = useState("Ready.");

  async function refreshNotifications() {
    const res = await getNotifications();
    if (!res.ok) {
      setStatus(res.error || "Unable to load notifications");
      return;
    }

    setPayload(res.data);
    setStatus("Notifications updated");
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <section className="card">
          <p className="mb-3 text-sm text-gray-300">
            Events include new messages, followers, sales, and stream status updates.
          </p>
          <button className="rounded bg-blue-600 px-4 py-2" onClick={refreshNotifications}>
            Load Notifications
          </button>
          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(payload, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-gray-300">{status}</p>
        </section>
      </main>
    </RoleGate>
  );
}
