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
              className="px-6 py-5 rounded-full font-semibold text-slate-600 hover:text-primary hover:bg-primary/10 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button className="btn-effect px-8 py-5 rounded-full font-bold text-white bg-gradient-to-r from-primary to-purple-600 border-0">
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
