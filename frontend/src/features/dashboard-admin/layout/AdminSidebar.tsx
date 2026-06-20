import Image from "next/image";
import { SidebarNavLinks } from "./NavLinks";

export function AdminSidebar() {
  return (
    <aside className="w-full md:w-60 max-lg:md:w-20 shrink-0 flex flex-row md:flex-col md:border-r h-full md:overflow-y-auto px-2 md:px-4 py-2 md:py-8 justify-between">
      {/* Logo */}
      <div className="hidden md:flex max-lg:mx-auto items-center gap-1 shadow-medium">
        <Image
          width={40}
          height={40}
          src="/logo.webp"
          alt="NeuroMeet Logo"
          className=""
        />
        <span className="font-extrabold tracking-tight bg-logo-gradient bg-clip-text text-transparent text-2xl max-lg:hidden">
          NeuroMeet
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-row md:flex-col max-sm:px-0.5 md:gap-3 mt-0 md:mt-8 flex-1 justify-between md:justify-start">
        <SidebarNavLinks />
      </nav>
    </aside>
  );
}
