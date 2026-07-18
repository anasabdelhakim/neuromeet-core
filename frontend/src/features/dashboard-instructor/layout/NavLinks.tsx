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
      {navItems.map(({ icon: Icon, label, href, hideOnMobile }) => {
        const active = pathname === href;
        return (
          <Tooltip key={href}>
            <TooltipTrigger
              render={
                <Link
                  href={href}
                  prefetch={true}
                  className={cn(
                    "flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-0 md:px-3 py-0.5 md:py-2.5 rounded-soft text-[12px] sm:text-xs md:text-base transition-all duration-fast ease-standard flex-1 md:flex-none",
                    active
                      ? "text-primary md:bg-primary md:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground md:hover:bg-secondary",
                    hideOnMobile && "max-md:hidden"
                  )}
                />
              }
            >
              <Icon
                className={cn(
                  "h-6 w-6 shrink-0",
                  active ? "text-primary md:text-primary-foreground" : "",
                )}
              />
              <span className="md:max-lg:hidden block text-center md:text-left w-full truncate leading-tight">{label}</span>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={7}
              className={cn(
                "hidden md:block lg:hidden",
                active && "pointer-events-none md:hidden hidden",
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
