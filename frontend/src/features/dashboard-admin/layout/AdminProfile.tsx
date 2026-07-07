import AvatarSec from "@/src/features/auth/components/avatar";

export function AdminProfile() {

  const adminProfile = {
    name: "Admin",
    email: "admin@neuromeet.com",
    avatarUrl: null,
  };

  return <AvatarSec profile={adminProfile} />;
}
