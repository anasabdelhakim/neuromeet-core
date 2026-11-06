import React from "react";
import Image from "next/image";

interface AuthWrapperProps {
  title?: string;
  description?: string;
  showLogo?: boolean;
  imageSrc?: string;
  children: React.ReactNode;
}

export default function AuthWrapper({
  title,
  description,
  showLogo,
  imageSrc = "/images/auth.webp",
  children,
}: AuthWrapperProps) {
  return (
    <div className="relative min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden w-full bg-[#0A0D18] text-foreground font-sans flex flex-col lg:grid lg:grid-cols-[40%_60%]">
      <div className="absolute -top-32 -left-28 w-96 h-96 scale-[1.25] rounded-full pointer-events-none blur-3xl bg-auth-scene-before-radial opacity-30" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none blur-3xl bg-auth-scene-after-radial opacity-30" />
      <AuthFormColumn title={title} description={description}>
        {children}
      </AuthFormColumn>
      <AuthImageColumn imageSrc={imageSrc} />
    </div>
  );
}

const AuthHeader = ({ title, description }: { title?: string; description?: string }) => {
  if (!title && !description) return null;
  return (
    <div className="flex flex-col gap-1.5 text-left mb-2">
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
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="relative z-10 w-full flex flex-col justify-center p-6 sm:p-8 lg:p-8 xl:p-10 min-h-[100dvh] lg:min-h-0 lg:h-full lg:overflow-y-auto">
    <div className="w-full max-w-sm mx-auto flex flex-col gap-5 py-2">
      <AuthHeader title={title} description={description} />
      <div className="w-full">{children}</div>
    </div>
  </div>
);

const AuthImageColumn = ({ imageSrc }: { imageSrc: string }) => (
  <div className="hidden lg:block w-full relative h-full min-h-[100dvh] lg:min-h-0 lg:h-full overflow-hidden border-l border-white/10 bg-[#080B14]">
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
