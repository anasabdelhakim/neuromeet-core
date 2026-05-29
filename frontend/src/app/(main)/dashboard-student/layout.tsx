import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neuro Meeting",
  description: "NeuroMeet is a platform for communication and collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
