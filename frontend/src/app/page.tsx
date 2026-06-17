import Image from "next/image";
import { Avtar, Hero, Logo, QuickJoin,NeuroFooter,NeuroFeatures } from "@/src/features/landing";

export default function ClarityConnectPage() {
  return (
    <div className="text-foreground flex flex-col relative antialiased">
      <Image
        src="/landingbg.webp"
        alt="Landing Background"
        fill
        priority
        className="object-cover -z-10"
      />
      <header className="w-full max-w-8xl mx-auto py-3 px-3 md:px-12 lg:px-24 flex items-center justify-between sticky top-0 z-50  bg-header-gradient">
        <Logo />
        <Avtar />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center max-sm:px-2 z-10  relative max-sm:pb-0 pb-20 px-6">
        <Hero />
        <QuickJoin />
        <NeuroFeatures />
      </main>
      <NeuroFooter />
    </div>
  );
}
