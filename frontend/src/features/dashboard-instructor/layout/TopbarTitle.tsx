"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming",
  "/dashboard-instructor/previous": "Previous",
  "/dashboard-instructor/recordings": "Recordings",
  "/dashboard-instructor/students": "Students",
  "/dashboard-instructor/test-meeting": "Test Meeting",
};

export function TopbarTitle() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
