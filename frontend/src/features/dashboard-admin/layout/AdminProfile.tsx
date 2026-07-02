import AvatarSec from "@/src/features/auth/components/avatar";

export function AdminProfile() {
  // Constant hardcoded admin profile to avoid unnecessary DB calls.
  // The name "Admin" ensures the initial 'A' is rendered in the avatar.
  const adminProfile = {
    name: "Admin",
    email: "admin@neuromeet.com",
    avatarUrl: null,
  };

  return <AvatarSec profile={adminProfile} />;
}
