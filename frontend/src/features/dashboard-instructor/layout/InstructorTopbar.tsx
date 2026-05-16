"use client";

import { usePathname } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";

import { Bell, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

// Map paths to their respective titles
const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming Meetings",
  "/dashboard-instructor/past": "Past Meetings",
  "/dashboard-instructor/recordings": "Recordings",
  "/dashboard-instructor/settings": "Settings",
};

export function InstructorTopbar() {
  const pathname = usePathname();

  // Get the title from the mapping, default to "Dashboard" if not found
  const title = pageTitles[pathname] || "Dashboard";
  return (
    <header
      className={cn(
        "flex items-center justify-between px-8 pt-6 pb-3 gap-4 transition-all z-50 bg-transparent",
      )}
    >
      <h1 className="text-2xl font-semibold">{title}</h1>

      {/* Search pill */}
      <InputGroup className="w-md py-5">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search className="size-5" />
        </InputGroupAddon>
      </InputGroup>
      {/* Bell */}
      <button aria-label="Notifications" className="">
        <Bell className="" />
        <span className="" />
      </button>
    </header>
  );
}
