import Image from "next/image";
import { SidebarNavLinks } from "./NavLinks";

export function InstructorSidebar() {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white/2 border-r h-full overflow-y-auto px-4 py-8">
      {/* Logo */}
      <div className="flex items-center gap-1 logo-dropshadow-effect">
        <Image
          src="/logo.webp"
          alt="NeuroMeet Logo"
          width={40}
          height={40}
          className=""
        />
        <span className="logo-name-style text-2xl">NeuroMeet</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-3 mt-8 flex-1">
        <SidebarNavLinks />
      </nav>
    </aside>
  );
}
