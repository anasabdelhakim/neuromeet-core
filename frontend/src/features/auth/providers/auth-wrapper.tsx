import React from "react";

interface AuthWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthWrapper({ title, description, children }: AuthWrapperProps) {
  return (
    <div className="relative overflow-hidden bg-auth-scene-gradient bg-[length:300%_300%] animate-gradient-shift flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* Before radial */}
      <div className="absolute -top-[120px] -left-[100px] w-[480px] h-[480px] rounded-full pointer-events-none blur-[90px] bg-auth-scene-before-radial animate-orb-float-before" />
      
      {/* After radial */}
      <div className="absolute -bottom-[80px] -right-[80px] w-[400px] h-[400px] rounded-full pointer-events-none blur-[90px] bg-auth-scene-after-radial animate-orb-float-after [animation-delay:-4s]" />
      <div className="flex w-full flex-col gap-5 items-center max-w-sm z-10 relative animate-page-entrance">
        <h1 className="text-3xl font-bold tracking-tight bg-brand-gradient bg-clip-text text-transparent text-center">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm -mt-2 text-center">
          {description}
        </p>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
