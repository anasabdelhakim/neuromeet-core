import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => (
  <section className="relative overflow-hidden border-b border-white/10 bg-[#080B14] text-white pt-8 pb-16 md:pt-10 md:pb-20 lg:pt-12 lg:pb-24">
    <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-20 right-10 size-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
    <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-16">
      <HeroTextColumn />
      <HeroMediaColumn />
    </div>
  </section>
);

const HeroTextColumn = () => (
  <div className="flex flex-col items-start gap-6 lg:col-span-5">
    <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-[60px]">
      Smarter Video Meetings
    </h1>
    <p className="max-w-xl text-lg leading-relaxed text-zinc-300">
      Experience the future of video meetings. Real-time AI transcriptions, ADHD focus insights, and seamless collaborative conferencing for learners and instructors.
    </p>
    <Link
      href="/sign-up"
      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
    >
      Get Started
    </Link>
  </div>
);

const HeroMediaColumn = () => (
  <div className="flex justify-center lg:col-span-7 lg:justify-end">
    <div className="relative aspect-[4/3] w-full max-w-[680px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-hard">
      <Image
        src="/images/hero-meeting.webp"
        alt="NeuroMeet video meeting on a laptop with remote participants"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  </div>
);
