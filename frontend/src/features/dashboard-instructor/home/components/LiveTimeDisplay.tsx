import { connection } from "next/server";

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

export async function ServerTimeDisplay() {
  await connection();

  const now = new Date();

  return (
    <>
      <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-sm md:text-7xl">
        {formatTime(now)}
      </h1>
      <p className="mt-2 text-lg font-medium text-white-soft-deep md:text-xl">
        {formatDate(now)}
      </p>
    </>
  );
}
