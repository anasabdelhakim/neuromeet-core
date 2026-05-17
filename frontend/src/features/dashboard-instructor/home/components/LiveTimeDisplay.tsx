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

export function LiveTimeDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <>
        <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-sm md:text-7xl opacity-0">
          --:-- --
        </h1>
        <p className="mt-2 text-lg font-medium text-white/50 md:text-xl opacity-0">
          Loading...
        </p>
      </>
    );
  }


  return (
    <>
      <h1
        suppressHydrationWarning
        className="text-6xl font-black tracking-tighter text-white drop-shadow-sm md:text-7xl"
      >
        {formatTime(now)}
      </h1>
      <p
        suppressHydrationWarning
        className="mt-2 text-lg font-medium text-white/50 md:text-xl"
      >
        {formatDate(now)}
      </p>
    </>
  );
}
