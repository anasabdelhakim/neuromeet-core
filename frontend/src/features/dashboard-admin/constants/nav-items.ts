import { Home, Users, Shield } from "lucide-react";
import type { NavItem } from "@/src/features/dashboard-shared/types/nav";
export const adminNavItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/dashboard-admin" },
  { icon: Users, label: "Users", href: "/dashboard-admin/users" },
  { icon: Shield, label: "Audit Log", href: "/dashboard-admin/audit" },
];
export const adminTitleMap: Record<string, string> = {
  "/dashboard-admin": "Admin Dashboard",
  "/dashboard-admin/users": "User Management",
  "/dashboard-admin/audit": "Audit Log",
};