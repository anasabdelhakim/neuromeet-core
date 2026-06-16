import { Suspense } from "react";

import AvatarSec from "@/src/features/auth/components/avatar";
import { getUserProfile } from "@/src/features/auth/actions/auth-actions";

async function UserProfileData() {
  const user = await getUserProfile();

  // If user is null (e.g., token expired but middleware hasn't caught it yet, or network error),
  // we fallback to a generic avatar instead of rendering login buttons inside the dashboard.
  const profileToRender = user || {
    name: "User",
    email: "",
    avatarUrl: null,
  };

  return <AvatarSec profile={profileToRender} />;
}

export default function UserProfile() {
  return (
    <Suspense 
      fallback={
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse border border-border flex-shrink-0" />
      }
    >
      <UserProfileData />
    </Suspense>
  );
}
