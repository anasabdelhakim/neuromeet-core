import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
  preload: true,
});
export const metadata: Metadata = {
  title: "Neuro Meeting",
  description: "NeuroMeet is a platform for communication and collaboration",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        "font-sans",
      )}
    >
      <body className="min-h-screen w-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
