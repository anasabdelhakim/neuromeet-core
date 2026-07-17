"use client";
import React from "react";
export const DashboardBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-background">
        {}
        <div className="absolute inset-0 bg-dashboard-spots-radial" />
        {}
        <div className="absolute inset-0 pointer-events-none bg-dashboard-vignette-radial" />
      </div>
      <div className="relative w-full h-full flex">
        {children}
      </div>
    </div>
  );
};
