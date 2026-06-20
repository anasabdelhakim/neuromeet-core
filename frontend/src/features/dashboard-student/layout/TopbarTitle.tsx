"use client";
import { usePathname } from "next/navigation";
import { studentTitleMap } from "../constants/nav-items";

export function TopbarTitle() {
  const pathname = usePathname();
  const title = studentTitleMap[pathname] || "Student Dashboard";

  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
