import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export const Avtar = () => {
  return (
   
        <div className="flex gap-4 max-sm:gap-2 items-center">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="px-6 max-sm:px-3 max-sm:py-3 py-5 rounded-full max-sm:text-xs font-semibold max-sm:rounded-hard text-muted-foreground hover:text-primary hover:bg-primary-soft-subtle transition-all duration-fast ease-standard"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/sign-up">
            <Button variant="effect" className="px-8 py-5 max-sm:px-3 max-sm:py-3 max-sm:text-xs max-sm:rounded-hard  rounded-full font-bold">
              Register
            </Button>
          </Link>
        </div>
  
  );
};
