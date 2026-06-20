import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import { useEffect, useState, type ChangeEvent } from "react";
import {
  deleteVaultItem,
  getVaultItems,
  uploadVaultItem,
} from "../../src/dashboard/api/engine/engine-bridge";
import ProfileMediaEditor from "../../src/components/ProfileMediaEditor";

export default function SettingsPage() {
  const [vaultItems, setVaultItems] = useState<unknown>(null);
  const [itemId, setItemId] = useState("");
  const [status, setStatus] = useState("Ready.");

  async function refreshVault() {
    const res = await getVaultItems();
    if (!res.ok) {
      setStatus(res.error || "Unable to load vault items");
      return;
    }

    setVaultItems(res.data);
    setStatus("Vault loaded");
  }

  useEffect(() => {
    refreshVault();
  }, []);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const res = await uploadVaultItem(file);
    if (!res.ok) {
      setStatus(res.error || "Unable to upload vault item");
      return;
    }

    await refreshVault();
  }

  async function onDelete() {
    if (!itemId.trim()) {
      setStatus("Enter an item ID to delete");
      return;
    }

    const res = await deleteVaultItem(itemId.trim());
    if (!res.ok) {
      setStatus(res.error || "Unable to delete vault item");
      return;
    }

    setItemId("");
    await refreshVault();
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="rounded border border-gray-700 bg-gray-900/60 p-4">
          <p>Workspace and stream configuration settings.</p>
        </div>
        <ProfileMediaEditor />

        <section className="rounded border border-gray-700 bg-gray-900/60 p-4">
          <h2 className="text-lg font-semibold">Creator Vault</h2>
          <p className="mt-1 text-sm text-gray-300">Upload, list, and delete vault assets.</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <label className="rounded bg-blue-600 px-4 py-2">
              Upload File
              <input className="hidden" type="file" onChange={onUpload} />
            </label>
            <button className="rounded bg-gray-700 px-4 py-2" onClick={refreshVault}>
              Refresh Vault
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
              placeholder="Vault item ID"
              value={itemId}
              onChange={(event) => setItemId(event.target.value)}
            />
            <button className="rounded bg-red-600 px-4 py-2" onClick={onDelete}>
              Delete
            </button>
          </div>

          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(vaultItems, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-gray-300">{status}</p>
        </section>
      </main>
    </RoleGate>
  );
}
