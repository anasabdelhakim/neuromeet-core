import React from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

interface AuthWrapperProps {
  title?: string;
  description?: string;
  showLogo?: boolean;
  imageSrc?: string;
  position?: "center" | "start";
  children: React.ReactNode;
}

export default function AuthWrapper({
  title,
  description,
  showLogo,
  imageSrc = "/images/auth.webp",
  position = "center",
  children,
}: AuthWrapperProps) {
  return (
    <div className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#0A0D18] text-foreground font-sans flex flex-col lg:grid lg:grid-cols-[40%_60%]">
      <div className="absolute -top-32 -left-28 w-96 h-96 scale-[1.25] rounded-full pointer-events-none blur-3xl bg-auth-scene-before-radial opacity-30" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none blur-3xl bg-auth-scene-after-radial opacity-30" />
      <AuthFormColumn title={title} description={description} position={position}>
        {children}
      </AuthFormColumn>
      <AuthImageColumn imageSrc={imageSrc} />
    </div>
  );
}

const AuthHeader = ({ title, description }: { title?: string; description?: string }) => {
  if (!title && !description) return null;
  return (
    <div className="flex flex-col gap-1 text-left mb-1">
      {title && (
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-sm text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
};

const AuthFormColumn = ({
  title,
  description,
  position = "center",
  children,
}: {
  title?: string;
  description?: string;
  position?: "center" | "start";
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "relative z-10 w-full flex flex-col px-4 sm:px-6 lg:px-8 h-full min-h-full overflow-y-auto overflow-x-hidden",
      position === "start"
        ? "justify-start py-6 sm:py-10 lg:py-14"
        : "justify-center py-4 sm:py-6"
    )}
  >
    <div
      className={cn(
        "w-full max-w-sm mx-auto flex flex-col gap-3",
        position === "center" && "my-auto"
      )}
    >
      <AuthHeader title={title} description={description} />
      <div className="w-full">{children}</div>
    </div>
  </div>
);

const AuthImageColumn = ({ imageSrc }: { imageSrc: string }) => (
  <div className="hidden lg:block w-full relative h-screen max-h-screen overflow-hidden border-l border-white/10 bg-[#080B14] select-none pointer-events-none">
    <Image
      src={imageSrc}
      alt="NeuroMeet AI Collaboration"
      fill
      priority
      sizes="(max-width: 1024px) 100vw, 60vw"
      className="object-cover object-center"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D18]/70 via-transparent to-transparent pointer-events-none" />
  </div>
);
