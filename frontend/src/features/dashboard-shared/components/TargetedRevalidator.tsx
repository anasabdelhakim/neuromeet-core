"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TargetedRevalidatorProps {
  targetDateIso: string;
}

export function TargetedRevalidator({ targetDateIso }: TargetedRevalidatorProps) {
  const router = useRouter();

  useEffect(() => {
    if (!targetDateIso) return;

    const targetTime = new Date(targetDateIso).getTime();
    const now = Date.now();
    const timeUntilStart = targetTime - now;

    if (timeUntilStart <= 0) return;
    const timer = setTimeout(() => {
      router.refresh();
    }, timeUntilStart + 500);

    return () => clearTimeout(timer);
  }, [targetDateIso, router]);

  return null;
}
