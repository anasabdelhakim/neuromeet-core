import {
  Home,
  CalendarDays,
  History,
  Video,
  Users,
  HatGlasses,
} from "lucide-react";

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
    icon: HatGlasses,
    label: "Private Room",
    href: "/dashboard-instructor/private-room",
  },
  { icon: Users, label: "Students", href: "/dashboard-instructor/students" },
];
