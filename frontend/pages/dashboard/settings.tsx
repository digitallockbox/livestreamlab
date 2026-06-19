import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function SettingsPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Settings</h1>
        <div className="card">
          <p>Workspace and stream configuration settings will appear here.</p>
        </div>
      </main>
    </RoleGate>
  );
}
