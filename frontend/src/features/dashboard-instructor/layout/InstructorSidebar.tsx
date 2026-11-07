"use client";

import { BrandLottieLogo } from "@/src/features/landing/components/BrandLottieLogo";
import { SidebarNavLinks } from "./NavLinks";

export function InstructorSidebar() {
  return (
    <aside className="w-full md:w-60 max-lg:md:w-20 shrink-0 flex flex-row md:flex-col md:border-r h-full md:overflow-y-auto px-0 md:px-4 py-2 md:py-8 justify-between">
      <div className="hidden md:flex max-lg:mx-auto items-center">
        <BrandLottieLogo
          iconClassName="w-14 h-14 sm:w-16 sm:h-16"
          textClassName="text-xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent max-lg:hidden"
        />
      </div>
      <nav className="flex flex-row md:flex-col max-sm:px-0.5 md:gap-3 mt-0 md:mt-3 flex-1 justify-between md:justify-start">
        <SidebarNavLinks />
      </nav>
    </aside>
  );
}
