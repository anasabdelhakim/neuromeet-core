import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
interface AuthTabsProps {
  activeTab: "sign-in" | "sign-up";
}
export function AuthTabs({ activeTab }: AuthTabsProps) {
  const isSignUp = activeTab === "sign-up";
  return (
    <div className="pt-1 flex justify-center w-11/12 mx-auto">
      <div className="flex w-full bg-muted/60 p-1 rounded-xl border border-border/50">
        <Link
          href="/sign-in"
          className={`
            flex-1 flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200
            ${
              !isSignUp
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground font-medium hover:text-foreground"
            }
          `}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className={`
            flex-1 flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200
            ${
              isSignUp
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground font-medium hover:text-foreground"
            }
          `}
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </Link>
      </div>
    </div>
  );
}
