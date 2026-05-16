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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
