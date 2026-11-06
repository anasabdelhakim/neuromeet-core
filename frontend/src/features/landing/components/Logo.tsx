"use client";

import { BrandLottieLogo } from "./BrandLottieLogo";
import { useReducedMotionLottie } from "../hooks/use-reduced-motion-lottie";

export const Logo = () => {
  const lottieRef = useReducedMotionLottie();
  return (
    <BrandLottieLogo
      dotLottieRefCallback={lottieRef}
      iconClassName="w-16 h-16 sm:w-20 sm:h-20"
      textClassName="text-2xl sm:text-3xl"
      href="/"
    />
  );
};
