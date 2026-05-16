"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { navItems } from "../constants/nav-items";
export function SidebarNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-md transition-all duration-200 ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                active ? "text-sidebar-primary-foreground" : "",
              )}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}
