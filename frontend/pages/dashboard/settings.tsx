import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import ProfileMediaEditor from "../../src/components/ProfileMediaEditor";

export default function SettingsPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="rounded border border-gray-700 bg-gray-900/60 p-4">
          <p>Workspace and stream configuration settings will appear here.</p>
        </div>
        <ProfileMediaEditor />
      </main>
    </RoleGate>
  );
}
