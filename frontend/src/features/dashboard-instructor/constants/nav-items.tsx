import { Home, CalendarDays, History, Video, Sparkles } from "lucide-react";

export const navItems = [
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
  {
    icon: Sparkles,
    label: "Meeting",
    href: "/dashboard-instructor/test-meeting",
  },
];
