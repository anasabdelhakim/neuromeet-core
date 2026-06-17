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
      <h1 className="text-6xl max-sm:text-[3.25rem] font-black tracking-tighter text-white shadow-soft md:text-7xl">
        {formatTime(now)}
      </h1>
      <p className="mt-2 text-lg max-sm:text-base font-medium text-white-soft-deep md:text-xl">
        {formatDate(now)}
      </p>
    </>
  );
}
