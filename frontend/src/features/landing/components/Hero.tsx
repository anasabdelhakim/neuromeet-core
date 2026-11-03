import { Button, buttonVariants } from "@/src/components/ui/button";
import Link from "next/link";
export const Hero = () => {
  return (
    <section className="max-w-3xl mx-auto text-center mt-8 max-sm:mt-6 mb-16 max-sm:mb-12">
      <h1 className="text-foreground text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
        Ultra-low latency meetings, <br className="hidden md:block" /> built for real-time focus.
      </h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        Engineered around custom WebRTC streaming and high-throughput NestJS pipelines. Fast, reliable, and distraction-free collaboration.
      </p>
      <Link
        href="/sign-in"
        className={buttonVariants({ size: "lg", className: "!rounded-full px-8 py-5 text-base font-semibold shadow-xs" })}
      >
        Get Started for Free
      </Link>
    </section>
  );
};
