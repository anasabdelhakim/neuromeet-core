import Link from "next/link";
import { Logo } from "./Logo";

export const AlloyHeader = () => (
  <header className="sticky top-0 z-50 border-b border-border bg-card shadow-soft">
    <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 sm:flex-nowrap sm:py-0 lg:px-16">
      <Logo />
      <AccountNavigation />
    </div>
  </header>
);

const AccountNavigation = () => (
  <nav aria-label="Account" className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
    <Link
      href="/sign-in"
      className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
    >
      Sign In
    </Link>
    <Link
      href="/sign-up"
      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
    >
      Get Started
    </Link>
  </nav>
);
