import { useState } from "react";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import {
  banAdminUser,
  getAdminProducts,
  getAdminStreams,
  getAdminUsers,
  removeAdminContent,
} from "../../src/dashboard/api/engine/engine-bridge";

export default function AdminPanelPage() {
  const [users, setUsers] = useState<unknown>(null);
  const [streams, setStreams] = useState<unknown>(null);
  const [products, setProducts] = useState<unknown>(null);
  const [userId, setUserId] = useState("");
  const [contentId, setContentId] = useState("");
  const [status, setStatus] = useState("Ready.");

  async function refreshAll() {
    const [usersRes, streamsRes, productsRes] = await Promise.all([
      getAdminUsers(),
      getAdminStreams(),
      getAdminProducts(),
    ]);

    if (usersRes.ok) setUsers(usersRes.data);
    if (streamsRes.ok) setStreams(streamsRes.data);
    if (productsRes.ok) setProducts(productsRes.data);

    if (!usersRes.ok || !streamsRes.ok || !productsRes.ok) {
      setStatus(
        usersRes.error || streamsRes.error || productsRes.error || "Unable to refresh admin data"
      );
      return;
    }

    setStatus("Admin data refreshed");
  }

  async function onBanUser() {
    if (!userId.trim()) {
      setStatus("User ID is required to ban");
      return;
    }

    const res = await banAdminUser(userId.trim());
    if (!res.ok) {
      setStatus(res.error || "Unable to ban user");
      return;
    }

    setStatus("User ban request sent");
    await refreshAll();
  }

  async function onRemoveContent() {
    if (!contentId.trim()) {
      setStatus("Content ID is required to remove");
      return;
    }

    const res = await removeAdminContent(contentId.trim());
    if (!res.ok) {
      setStatus(res.error || "Unable to remove content");
      return;
    }

    setStatus("Content removal request sent");
    await refreshAll();
  }

  return (
    <RoleGate requiredRoles={["admin"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <section className="card space-y-3">
          <button className="rounded bg-blue-600 px-4 py-2" onClick={refreshAll}>
            Load Admin Data
          </button>

          <div className="grid gap-3 md:grid-cols-2">
            <label>
              User ID
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              />
            </label>
            <label>
              Content ID
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={contentId}
                onChange={(event) => setContentId(event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-red-600 px-4 py-2" onClick={onBanUser}>
              Ban User
            </button>
            <button className="rounded bg-amber-600 px-4 py-2" onClick={onRemoveContent}>
              Remove Content
            </button>
          </div>

          <h2 className="text-lg font-semibold">Users</h2>
          <pre className="overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(users, null, 2)}
          </pre>

          <h2 className="text-lg font-semibold">Streams</h2>
          <pre className="overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(streams, null, 2)}
          </pre>

          <h2 className="text-lg font-semibold">Products</h2>
          <pre className="overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(products, null, 2)}
          </pre>

          <p className="text-sm text-gray-300">{status}</p>
        </section>
      </main>
    </RoleGate>
  );
}
