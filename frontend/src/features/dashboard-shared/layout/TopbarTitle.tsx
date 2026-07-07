"use client";
import { usePathname } from "next/navigation";
export function TopbarTitle({ titleMap }: { titleMap: Record<string, string> }) {
  const pathname = usePathname();
  const title = titleMap[pathname] || "Dashboard";
  return <h1 className="text-2xl font-semibold">{title}</h1>;
}