import { Home, CalendarDays, History, Video, Sparkles, Users, Component, BarChart3 } from "lucide-react";
export type NavItem = {
  icon: any;
  label: string;
  href: string;
  hideOnMobile?: boolean;
};
export const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard-instructor" },
  {
    icon: CalendarDays,
    label: "Upcoming",
    href: "/dashboard-instructor/upcoming",
  },
  { icon: History, label: "Previous", href: "/dashboard-instructor/previous" },
  {
    icon: Video,
    label: "Recordings",
    href: "/dashboard-instructor/recordings",
  },
  { icon: Users, label: "Students", href: "/dashboard-instructor/students" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard-instructor/analytics", hideOnMobile: true },
  { icon: Component, label: "Groups", href: "/dashboard-instructor/groups", hideOnMobile: true },
];
