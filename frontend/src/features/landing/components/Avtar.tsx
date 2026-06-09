import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export const Avtar = () => {
  return (
    <>
      {true ? (
        <div className="flex gap-4 items-center">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="px-6 py-5 rounded-full font-semibold text-muted-foreground hover:text-primary hover:bg-primary-soft-subtle transition-all duration-fast ease-standard"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button variant="effect" className="px-8 py-5 rounded-full font-bold">
              Register
            </Button>
          </Link>
        </div>
      ) : (
        <div>Avatar</div>
      )}
    </>
  );
};
