import Image from "next/image";
import { Avtar, Hero, Logo, QuickJoin } from "@/src/features/landing";

export default function ClarityConnectPage() {
  return (
    <div className="text-foreground flex flex-col relative  lg:overflow-hidden lg:h-screen antialiased">
      <Image
        src="/landingbg.webp"
        alt="Landing Background"
        fill
        priority
        className="object-cover -z-10"
      />
<<<<<<< HEAD
      <header className="w-full max-w-8xl mx-auto py-4 px-6 md:px-12 lg:px-24 flex items-center justify-between z-10 relative sticky top-0 ">
        <Logo />
=======
      <header className="w-full max-w-8xl mx-auto py-4 px-6 md:px-12 lg:px-24 flex items-center justify-between sticky top-0 z-50 max-sm:border-b max-sm:bg-background-header-sm">        <Logo />
>>>>>>> ultimate-project/optmizations
        <Avtar />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-6 z-10 relative pb-20">
        <Hero />
        <QuickJoin />
      </main>
    </div>
  );
}
