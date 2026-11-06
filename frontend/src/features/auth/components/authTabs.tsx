import React from "react";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AuthTabsProps {
  activeTab: "sign-in" | "sign-up";
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  const isSignUp = activeTab === "sign-up";
  return (
    <div className="w-full flex justify-center font-sans">
      <div className="flex w-full bg-white/[0.06] p-1 rounded-full border border-white/10 backdrop-blur-md">
        <Link
          href="/sign-in"
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-fast",
            !isSignUp
              ? "bg-brand-gradient text-white font-semibold shadow-md"
              : "text-white/60 hover:text-white"
          )}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-fast",
            isSignUp
              ? "bg-brand-gradient text-white font-semibold shadow-md"
              : "text-white/60 hover:text-white"
          )}
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </Link>
      </div>
    </div>
  );
}
