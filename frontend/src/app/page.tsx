import { Avtar, Hero, Logo, QuickJoin } from "@/src/features/landing";

export default function ClarityConnectPage() {
  return (
    <div className=" text-foreground flex flex-col relative overflow-x-hidden antialiased bg-[url('/landing.webp')] bg-cover bg-center bg-no-repeat">
      <header className="w-full max-w-8xl mx-auto  py-4 px-6 md:px-12 lg:px-24 flex items-center justify-between z-10 relative">
        <Logo />
        <Avtar />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-6 z-10 relative pb-20">
        <Hero />
        <QuickJoin />
      </main>
    </div>
  );
}
