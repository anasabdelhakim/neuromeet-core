import Image from "next/image";

export const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-2 select-none">
      <Image
        src="/logo.webp"
        alt="NeuroMeet Logo"
        width={500}
        height={500}
        className="w-14 h-14 max-sm:w-12 max-sm:h-12 object-contain shadow-soft"
      />
      <h1 className="text-4xl max-sm:hidden font-extrabold tracking-tight bg-logo-gradient bg-clip-text text-transparent">
        NeuroMeet
      </h1>
    </div>
  );
};
