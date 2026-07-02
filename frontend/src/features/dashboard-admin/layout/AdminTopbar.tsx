import { NotificationDropdown } from "@/src/features/dashboard-instructor/layout/NotificationDropdown";
import { AdminProfile } from "./AdminProfile";
import { TopbarTitle } from "./TopbarTitle";

export function AdminTopbar() {
  return (
    <header className="z-sticky flex items-center justify-between gap-4 bg-transparent py-2 px-3 sm:px-8 sm:py-4 transition-all duration-normal ease-standard">
      <TopbarTitle />
      <div className="flex items-center gap-3 sm:gap-6">
        <NotificationDropdown />
        <AdminProfile />
      </div>
    </header>
  );
}
