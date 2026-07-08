import { Button, buttonVariants } from "@/src/components/ui/button";
import Link from "next/link";
export const Hero = () => {
  return (
    <section className="max-w-3xl mx-auto text-center mt-8 max-sm:mt-6 mb-16 max-sm:mb-12">
      <h1 className="text-foreground text-6xl max-sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
        Connect from anywhere <br className="hidden md:block" /> with crystal
        clarity.
      </h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        Experience the future of video conferencing. Seamless, high-definition,
        and secure meetings for everyone, everywhere.
      </p>
      <Link
        href="/sign-up"
        className={buttonVariants({ variant: "effect", size: "lg", className: "!rounded-full px-10 py-6 text-base" })}
      >
        Get Started for Free
      </Link>
    </section>
  );
};
