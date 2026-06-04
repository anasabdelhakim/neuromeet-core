import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="max-w-3xl mx-auto text-center mt-8 mb-16">
      <h1 className="text-foreground text-6xl  font-extrabold tracking-tight mb-6 leading-tight text-background">
        Connect from anywhere <br className="hidden md:block" /> with crystal
        clarity.
      </h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        Experience the future of video conferencing. Seamless, high-definition,
        and secure meetings for everyone, everywhere.
      </p>
      <Link href="livekit">
        <Button
          variant="effect"
          size="lg"
          className="rounded-full px-10 py-6 text-base"
        >
          Get Started for Free
        </Button>
      </Link>
    </section>
  );
};
