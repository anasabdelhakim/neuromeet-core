"use client";

import { useEffect, useState, type RefCallback } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

let lottieCache: ArrayBuffer | null = null;
let lottiePromise: Promise<ArrayBuffer> | null = null;

const fetchLottieCached = (): Promise<ArrayBuffer> => {
  if (lottieCache) return Promise.resolve(lottieCache);
  if (!lottiePromise) {
    lottiePromise = fetch("/Visibility.lottie")
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
      .then((buf) => {
        lottieCache = buf;
        return buf;
      })
      .catch((err) => {
        lottiePromise = null;
        throw err;
      });
  }
  return lottiePromise;
};

if (typeof window !== "undefined") {
  fetchLottieCached().catch(() => {});
}

const DotLottiePlayer = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" aria-hidden="true" />,
  }
);

interface BrandLottieLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: string;
  showText?: boolean;
  dotLottieRefCallback?: RefCallback<DotLottie | null>;
}

const BrandWordmark = ({ textClassName }: { textClassName?: string }) => (
  <span
    className={cn(
      "font-black tracking-tight uppercase font-sans bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent",
      textClassName
    )}
  >
    NeuroMeet
  </span>
);

const LogoInner = ({
  className,
  iconClassName,
  textClassName,
  showText,
  dotLottieRefCallback,
}: Omit<BrandLottieLogoProps, "href">) => {
  const [data, setData] = useState<ArrayBuffer | null>(() => lottieCache);

  useEffect(() => {
    if (!data) fetchLottieCached().then(setData).catch(() => {});
  }, [data]);

  return (
    <div className={cn("inline-flex items-center gap-0 select-none no-underline", className)}>
      <div className={cn("flex items-center justify-center shrink-0 overflow-hidden", iconClassName)} aria-hidden="true">
        <DotLottiePlayer
          {...(data ? { data } : { src: "/Visibility.lottie" })}
          loop
          autoplay
          dotLottieRefCallback={dotLottieRefCallback}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && <BrandWordmark textClassName={textClassName} />}
    </div>
  );
};

export const BrandLottieLogo = ({
  href = "/",
  iconClassName = "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24",
  showText = true,
  ...props
}: BrandLottieLogoProps) => {
  const content = <LogoInner iconClassName={iconClassName} showText={showText} {...props} />;
  if (href) {
    return (
      <Link href={href} className="inline-block group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan">
        {content}
      </Link>
    );
  }
  return content;
};
