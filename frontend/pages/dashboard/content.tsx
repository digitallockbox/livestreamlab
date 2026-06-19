import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function ContentPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Content</h1>
        <div className="card">
          <p>Content tools and scheduling will appear here.</p>
        </div>
      </main>
    </RoleGate>
  );
}
