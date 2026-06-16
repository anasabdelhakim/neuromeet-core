interface StatusBarProps {
  duration: number;
  isArrived?: boolean;
  timeLabel?: string;
}

export function StatusBar({
  duration,
  isArrived = false,
  timeLabel,
}: StatusBarProps) {
  const numberOfMarkers =
    Math.floor(duration / 15) - (duration % 15 === 0 ? 1 : 0);

  const markers = Array.from({ length: Math.max(0, numberOfMarkers) });

  return (
    <div className="w-full h-2 bg-muted-foreground-soft rounded-full relative mt-8">
      {markers.map((_, i) => {
        const minuteMark = (i + 1) * 15;
        const leftPercentage = (minuteMark / duration) * 100;

        return (
          <span
            key={minuteMark}
            className="w-0.5 h-full rounded-medium bg-muted-foreground-mid absolute top-0 -translate-x-1/2 z-0"
            style={{ left: `${leftPercentage}%` }}
          ></span>
        );
      })}

      <span
        className={`absolute top-0 left-0 h-full w-3/5 rounded-full z-10 ${
          isArrived
            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            : "bg-primary"
        }`}
      >
        <div className="absolute right-0.5 -top-7 flex flex-col items-center translate-x-1/2">
          <span className="rounded-medium px-2 py-0.5 text-xs font-medium bg-custom-gray text-foreground border shadow-medium whitespace-nowrap">
            {timeLabel || (isArrived ? "Live" : "Starting Soon")}
          </span>
          <div className="h-1.5 w-1.5 -translate-y-[3.5px] rotate-45 bg-custom-gray border-r border-b"></div>
        </div>
      </span>
    </div>
  );
}
