"use client";

import React from "react";

export const DashboardBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full relative text-foreground">
      <div className="fixed inset-0 -z-10 bg-[oklch(0.1_0.012_265)]">
        {/* Base Gradient Overlay to match auth pages */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `linear-gradient(135deg, oklch(0.08 0.025 260) 0%, oklch(0.1 0.02 240) 40%, oklch(0.12 0.03 290) 100%)`,
          }}
        />

        {/* Static Theme Spots (Optimized as radial gradients instead of heavy blurs) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 0% 0%, rgba(26, 118, 141, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(126, 87, 194, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 100% 0%, rgba(0, 210, 255, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 0% 100%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)
            `,
          }}
        />

        {/* Texture Overlay (Commented out for performance: SVG noise + backdrop-blur causes severe scroll lag) */}
        {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" /> */}

        {/* Subtle Vignette for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, transparent 30%, oklch(0.08 0.012 265) 100%)",
          }}
        />
      </div>
      {children}
    </div>
  );
};
