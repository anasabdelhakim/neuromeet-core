import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 h-dvh w-screen overflow-hidden bg-[#0A0D18]">
      {children}
    </div>
  );
}

