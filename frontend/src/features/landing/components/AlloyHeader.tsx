import Link from "next/link";
import { Logo } from "./Logo";

export const AlloyHeader = () => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B14]/90 backdrop-blur-md shadow-xs">
    <div className="mx-auto flex h-20 min-h-20 w-full max-w-7xl flex-nowrap items-center justify-between gap-4 px-4 sm:px-8 lg:px-16">
      <Logo />
      <AccountNavigation />
    </div>
  </header>
);

const AccountNavigation = () => (
  <nav aria-label="Account" className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 flex-nowrap">
    <Link
      href="/sign-in"
      className="rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-semibold text-zinc-200 transition-colors hover:text-white whitespace-nowrap"
    >
      Sign In
    </Link>
    <Link
      href="/sign-up"
      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 whitespace-nowrap shrink-0"
    >
      Get Started
    </Link>
  </nav>
);
