import { Home, CalendarDays, History, Video, Users } from "lucide-react";
import type { NavItem } from "@/src/features/dashboard-shared/types/nav";
export const studentNavItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard-student" },
  {
    icon: CalendarDays,
    label: "Upcoming",
    href: "/dashboard-student/upcoming",
  },
  {
    icon: Video,
    label: "Recordings",
    href: "/dashboard-student/recordings",
  },
  {
    icon: Users,
    label: "Groups",
    href: "/dashboard-student/groups",
  },
];
export const studentTitleMap: Record<string, string> = {
  "/dashboard-student": "Home",
  "/dashboard-student/upcoming": "Upcoming",
  "/dashboard-student/recordings": "Recordings",
  "/dashboard-student/groups": "Groups",
};