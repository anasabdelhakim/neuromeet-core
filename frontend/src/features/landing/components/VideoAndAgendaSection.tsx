import Image from "next/image";

const AGENDA_POINTS = [
  "Ultra-low latency 4K video conferencing built for seamless group learning.",
  "Real-time AI transcriptions and automated smart meeting summaries.",
  "ADHD-friendly engagement tracking that respects student privacy.",
  "Instant in-browser joining with no downloads or installation required.",
] as const;

export const VideoAndAgendaSection = () => (
  <section className="border-b border-border py-16 md:py-20 lg:py-24">
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-16">
      <VideoMediaColumn />
      <AgendaContentColumn />
    </div>
  </section>
);

const VideoMediaColumn = () => (
  <div className="order-2 flex justify-center lg:order-1 lg:col-span-5">
    <div className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-xl border border-border bg-card shadow-hard">
      <Image
        src="/images/meeting-boys.webp"
        alt="Team collaborating in a modern meeting room"
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover"
      />
    </div>
  </div>
);

const AgendaContentColumn = () => (
  <div className="order-1 flex flex-col items-start gap-8 lg:order-2 lg:col-span-7">
    <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
      What you can expect from NeuroMeet:
    </h2>
    <ul className="flex list-disc flex-col gap-4 pl-5 text-lg leading-relaxed text-muted-foreground">
      {AGENDA_POINTS.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  </div>
);
