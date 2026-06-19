import Home from "../../src/dashboard/home";
import RoleGate from "../../src/dashboard/shared/ui/RoleGate";

export default function HomePage() {
  return (
    <RoleGate requiredRoles={["admin"]}>
      <Home />
    </RoleGate>
  );
}
