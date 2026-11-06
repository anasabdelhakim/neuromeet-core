"use client";

import { useEffect, useState } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";

export function useReducedMotionLottie() {
  const [player, setPlayer] = useState<DotLottie | null>(null);
  useEffect(() => {
    if (!player) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      if (preference.matches) { player.pause(); player.setFrame(0); }
      else player.play();
    };
    player.addEventListener("load", updatePlayback);
    preference.addEventListener("change", updatePlayback);
    if (player.isLoaded) updatePlayback();
    return () => {
      player.removeEventListener("load", updatePlayback);
      preference.removeEventListener("change", updatePlayback);
    };
  }, [player]);
  return setPlayer;
}
