import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwtRole } from "@/src/lib/jwt";
import { getUserProfile } from "@/src/features/auth/actions/auth-actions";
import { Logo } from "./Logo";

export const AlloyHeader = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  let role: string | null = null;

  if (accessToken) {
    role = decodeJwtRole(accessToken);
  }
  if (!role) {
    const user = await getUserProfile();
    role = user?.role || null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B14]/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-18 min-h-18 sm:h-20 sm:min-h-20 w-full max-w-7xl flex-nowrap items-center justify-between gap-4 px-4 sm:px-8 lg:px-16">
        <Logo />
        <AccountNavigation role={role} />
      </div>
    </header>
  );
};

const getDashboardUrl = (role?: string | null) => {
  const normalized = role?.toUpperCase();
  if (normalized === "ADMIN") return "/dashboard-admin";
  if (normalized === "STUDENT") return "/dashboard-student";
  if (normalized === "INSTRUCTOR") return "/dashboard-instructor";
  return "/dashboard-instructor";
};

const AccountNavigation = ({ role }: { role: string | null }) => {
  if (role) {
    return <AuthenticatedNav role={role} />;
  }
  return <GuestNav />;
};

const AuthenticatedNav = ({ role }: { role?: string | null }) => (
  <nav aria-label="Account" className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 flex-nowrap">
    <Link
      href={getDashboardUrl(role)}
      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 whitespace-nowrap shrink-0"
    >
      Dashboard
    </Link>
  </nav>
);

const GuestNav = () => (
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
