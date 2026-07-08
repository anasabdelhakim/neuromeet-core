"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming",
  "/dashboard-instructor/previous": "Previous",
  "/dashboard-instructor/recordings": "Recordings",
  "/dashboard-instructor/students": "Students",
};

export function TopbarTitle() {
  const pathname = usePathname();
  let title = pageTitles[pathname] || "Dashboard";

  if (pathname.includes("/analytics")) {
    title = "Analytics";
  } else if (pathname.includes("/groups")) {
    // Check if it's the root groups page or a specific group details page
    if (pathname === "/dashboard-instructor/groups") {
      title = "Groups";
    } else {
      title = "Group Details";
    }
  }

  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
