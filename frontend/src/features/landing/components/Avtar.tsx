import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { decodeJwtRole } from "@/src/lib/jwt";
import { getUserProfile } from "@/src/features/auth/actions/auth-actions";

export const Avtar = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  let role = null;
  if (accessToken) {
    role = decodeJwtRole(accessToken);
  }

  if (!role) {
    const user = await getUserProfile();
    role = user?.role;
  }

  const getDashboardUrl = () => {
    if (role === "INSTRUCTOR") return "/dashboard-instructor";
    if (role === "STUDENT") return "/dashboard-student";
    if (role === "ADMIN") return "/dashboard-admin";
    return "/sign-in";
  };

  return (
    <div className="flex gap-4 max-sm:gap-2 items-center">
      {role ? (
        <Link href={getDashboardUrl()}>
          <Button className="px-8 py-5 max-sm:px-4 max-sm:py-4 max-sm:text-sm max-sm:rounded-hard rounded-full font-bold">
            Dashboard
          </Button>
        </Link>
      ) : (
        <>
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="px-6 max-sm:px-3 max-sm:py-3 py-5 rounded-full max-sm:text-sm font-semibold max-sm:rounded-hard text-muted-foreground hover:text-primary hover:bg-primary-soft-subtle transition-all duration-fast ease-standard"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button className="px-8 py-5 max-sm:px-4 max-sm:py-4 max-sm:text-sm max-sm:rounded-hard rounded-full font-bold">
              Register
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};
