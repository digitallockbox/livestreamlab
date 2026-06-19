import StreamHealth from "../../src/dashboard/stream-console/stream-health";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function StreamHealthPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <StreamHealth />
    </RoleGate>
  );
}
