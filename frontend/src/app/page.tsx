import {
  AlloyHeader,
  HeroSection,
  VideoAndAgendaSection,
  TestimonialCarousel,
  NeuroFooter,
} from "@/src/features/landing";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#080B14] font-sans text-foreground overflow-x-clip">
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-soft focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AlloyHeader />
      <main id="landing-main" tabIndex={-1} className="flex flex-1 flex-col">
        <HeroSection />
        <VideoAndAgendaSection />
        <TestimonialCarousel />
      </main>
      <NeuroFooter />
    </div>
  );
}
