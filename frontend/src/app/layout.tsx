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
  title: {
    template: "%s | NeuroMeet",
    default: "NeuroMeet - Crystal Clear AI Video Conferencing",
  },
  description: "Experience ultra-low latency 4K video conferencing built on our proprietary streaming protocol with real-time AI transcripts.",
  openGraph: {
    title: "NeuroMeet",
    description: "Smarter meetings. Better outcomes.",
    url: "https://neuromeet.anasdev.shop",
    siteName: "NeuroMeet",
    images: [
      {
        url: "https://neuromeet.anasdev.shop/landingbg.webp",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroMeet",
    description: "Smarter meetings. Better outcomes.",
  },
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
      <head>
        <link rel="llms" href="/llms.txt" />
      </head>
      <body className="min-h-screen w-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
