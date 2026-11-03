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
      <h1 className="text-3xl max-sm:hidden font-bold tracking-tight text-foreground">
        NeuroMeet
      </h1>
    </div>
  );
};
