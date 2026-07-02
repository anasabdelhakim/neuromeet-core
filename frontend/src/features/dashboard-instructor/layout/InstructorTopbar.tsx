import { Suspense } from "react";
import { TopbarTitle } from "./TopbarTitle";
import { NotificationDropdown } from "./NotificationDropdown";
import UserProfile from "@/src/app/(auth)/user-profile/profile";

export function InstructorTopbar() {
  return (
    <header className="z-sticky flex items-center justify-between gap-4 bg-transparent py-2 px-3 sm:px-8 sm:py-4 transition-all duration-normal ease-standard">
      
      <TopbarTitle />
      <div className="flex items-center gap-3 sm:gap-6">
        <NotificationDropdown />
        <Suspense fallback={<div className="w-10 h-10 rounded-full bg-muted animate-pulse border border-border flex-shrink-0" />}>
          <UserProfile />
        </Suspense>
      </div>
    </header>
  );
}
