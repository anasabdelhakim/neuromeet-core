import React from "react";
interface AuthWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}
export default function AuthWrapper({ title, description, children }: AuthWrapperProps) {
  return (
    <div className="relative overflow-hidden bg-background flex min-h-dvh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full flex-col gap-5 items-center max-w-sm z-10 relative">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-center">
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
