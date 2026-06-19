import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import ProfileMediaEditor from "../../src/components/ProfileMediaEditor";

export default function ProfileSettingsPage() {
  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 p-4 text-white">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <ProfileMediaEditor />
      </main>
    </RoleGate>
  );
}
