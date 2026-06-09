import Image from "next/image";
import { SidebarNavLinks } from "./NavLinks";

export function InstructorSidebar() {
  return (
    <aside className="w-60 max-lg:w-20 shrink-0 flex flex-col border-r h-full overflow-y-auto px-4 py-8">
      {/* Logo */}
      <div className="flex max-lg:mx-auto items-center gap-1 drop-shadow-md">
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
      <nav className="flex flex-col gap-3 mt-8 flex-1">
        <SidebarNavLinks />
      </nav>
    </aside>
  );
}
