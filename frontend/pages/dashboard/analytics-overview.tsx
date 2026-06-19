import AnalyticsOverview from "../../src/dashboard/analytics/overview";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function AnalyticsOverviewPage() {
  return (
    <RoleGate requiredRoles={["admin"]}>
      <AnalyticsOverview />
    </RoleGate>
  );
}
