import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function MonetizationPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main>
        <h1>Monetization</h1>
        <div className="card">
          <p>Revenue insights and payouts will appear here.</p>
        </div>
      </main>
    </RoleGate>
  );
}
