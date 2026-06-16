"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming Meetings",
  "/dashboard-instructor/previous": "Previous Meetings",
  "/dashboard-instructor/recordings": "Recordings",
};

export function TopbarTitle() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
