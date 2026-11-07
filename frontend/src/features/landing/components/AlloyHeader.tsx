import { Suspense } from "react";
import { Logo } from "./Logo";
import { Avtar } from "./Avtar";

export const AlloyHeader = () => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B14]/90 backdrop-blur-md shadow-xs">
    <div className="mx-auto flex h-18 min-h-18 sm:h-20 sm:min-h-20 w-full max-w-7xl flex-nowrap items-center justify-between gap-4 px-4 sm:px-8 lg:px-16">
      <Logo />
      <Suspense fallback={<div className="w-24 h-10 animate-pulse bg-white/5 rounded-full" />}>
        <Avtar />
      </Suspense>
    </div>
  </header>
);
