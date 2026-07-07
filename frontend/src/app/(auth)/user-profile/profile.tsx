import { Suspense } from "react";
import AvatarSec from "@/src/features/auth/components/avatar";
import { getUserProfile } from "@/src/features/auth/actions/auth-actions";
async function UserProfileData() {
  const user = await getUserProfile();
  if (!user) {
    return null;
  }
  return <AvatarSec profile={user} />;
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
