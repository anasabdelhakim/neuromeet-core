"use client";

import { BrandLottieLogo } from "./BrandLottieLogo";
import { useReducedMotionLottie } from "../hooks/use-reduced-motion-lottie";

export const Logo = () => {
  const lottieRef = useReducedMotionLottie();
  return (
    <BrandLottieLogo
      dotLottieRefCallback={lottieRef}
      iconClassName="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0"
      textClassName="hidden sm:inline text-2xl sm:text-3xl font-black"
      href="/"
    />
  );
};
