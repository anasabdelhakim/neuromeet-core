"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { navItems } from "../constants/nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export function SidebarNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map(({ icon: Icon, label, href }) => {
        const active = pathname === href;

        return (
          <Tooltip key={href}>
            <TooltipTrigger>
              <Link
                href={href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-soft text-md transition-all duration-normal ease-standard ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 shrink-0",
                    active ? "text-primary-foreground" : "",
                  )}
                />
                <span className="max-lg:hidden">{label}</span>
              </Link>
            </TooltipTrigger>

            <TooltipContent
              side="right"
              sideOffset={7}
              className={cn(
                "block lg:hidden ",
                active && "pointer-events-none hidden",
              )}
            >
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
