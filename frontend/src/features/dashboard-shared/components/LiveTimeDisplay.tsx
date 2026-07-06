"use client";

import { useState, useEffect } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ServerTimeDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client side to avoid hydration mismatch
    setNow(new Date());

    // Update the clock every minute
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <>
        <h1 className="text-6xl max-sm:text-[3.25rem] font-black tracking-tighter text-white/50 shadow-soft md:text-7xl">
          --:-- --
        </h1>
        <p className="mt-2 text-lg max-sm:text-base font-medium text-white/50 md:text-xl">
          Loading time...
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-6xl max-sm:text-[3.25rem] font-black tracking-tighter text-white shadow-soft md:text-7xl">
        {formatTime(now)}
      </h1>
      <p className="mt-2 text-lg max-sm:text-base font-medium text-white-soft-deep md:text-xl">
        {formatDate(now)}
      </p>
    </>
  );
}
