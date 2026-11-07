import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwtRole } from "@/src/lib/jwt";
import { getUserProfile } from "@/src/features/auth/actions/auth-actions";
import { buttonVariants } from "@/src/components/ui/button";

const resolveRole = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (accessToken) {
    const role = decodeJwtRole(accessToken);
    if (role) return role;
  }
  const user = await getUserProfile();
  return user?.role || null;
};

const getDashboardUrl = (role: string | null): string => {
  const normalized = role?.toUpperCase();
  if (normalized === "INSTRUCTOR") return "/dashboard-instructor";
  if (normalized === "STUDENT") return "/dashboard-student";
  if (normalized === "ADMIN") return "/dashboard-admin";
  return "/sign-in";
};

const LoggedInNav = ({ role }: { role: string }) => (
  <div className="flex gap-4 max-sm:gap-2 items-center">
    <Link
      href={getDashboardUrl(role)}
      className={buttonVariants({
        className: "px-8 py-5 max-sm:px-4 max-sm:py-4 max-sm:text-sm !rounded-full font-bold",
      })}
    >
      Dashboard
    </Link>
  </div>
);

const GuestNav = () => (
  <div className="flex gap-4 max-sm:gap-2 items-center">
    <Link
      href="/sign-in"
      className={buttonVariants({
        variant: "ghost",
        className:
          "px-6 max-sm:px-3 max-sm:py-3 py-5 !rounded-full max-sm:text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary-soft-subtle transition-all duration-fast ease-standard",
      })}
    >
      Sign In
    </Link>
    <Link
      href="/sign-up"
      className={buttonVariants({
        className: "px-8 py-5 max-sm:px-4 max-sm:py-4 max-sm:text-sm !rounded-full font-bold",
      })}
    >
      Register
    </Link>
  </div>
);

export const Avtar = async () => {
  const role = await resolveRole();
  if (role) {
    return <LoggedInNav role={role} />;
  }
  return <GuestNav />;
};
