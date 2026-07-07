"use client";

import { Brain } from "lucide-react";
import { useClock } from "@/src/hooks/useClock";

interface MeetingHeaderProps {
  room: string;
}

export function MeetingHeader({ room }: MeetingHeaderProps) {
  const currentTime = useClock();

  const readableRoom = room
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-card flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-soft bg-primary flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
          Neuro<span className="text-brand-cyan">Meet</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground truncate max-w-xs">
          {readableRoom}
        </span>
      </div>

      <span className="text-xs font-medium text-muted-foreground tabular-nums hidden sm:block">
        {currentTime}
      </span>
    </header>
  );
}
