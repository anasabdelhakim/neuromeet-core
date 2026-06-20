"use client";
import { usePathname } from "next/navigation";
import { adminTitleMap } from "../constants/nav-items";

export function TopbarTitle() {
  const pathname = usePathname();
  const title = adminTitleMap[pathname] || "Admin Dashboard";

  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
