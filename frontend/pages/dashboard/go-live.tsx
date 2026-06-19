import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function GoLivePage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Go Live</h1>
        <div className="card">
          <p>Go-live controls will appear here.</p>
        </div>
      </main>
    </RoleGate>
  );
}
