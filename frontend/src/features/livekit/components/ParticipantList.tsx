"use client";

import { useParticipants } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export function ParticipantList() {
  const participants = useParticipants();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-border flex-shrink-0">
        <p className="text-xs text-muted-foreground font-medium">
          {participants.length} in this call
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {participants.map((p) => {
          const initials = p.identity
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          let isInstructor = false;
          try {
            if (p.metadata) {
              const meta = JSON.parse(p.metadata);
              isInstructor = meta.role === "INSTRUCTOR";
            }
          } catch (_) {}

          return (
            <div
              key={p.identity}
              className="flex items-center gap-3 px-3 py-2.5 rounded-card hover:bg-black-soft-muted transition-colors duration-normal"
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary-soft-muted border border-border flex items-center justify-center text-xs font-bold text-primary-light">
                  {initials}
                </div>
                {p.isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-status-success border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-white truncate">
                    {p.identity}
                  </p>
                  {isInstructor && (
                    <span className="text-[10px] font-semibold text-brand-cyan bg-black-soft-muted border border-border px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.isSpeaking ? "Speaking" : "Joined"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {p.isMicrophoneEnabled ? (
                  <Mic size={14} className="text-muted-foreground" />
                ) : (
                  <MicOff size={14} className="text-destructive" />
                )}
                {p.isCameraEnabled ? (
                  <Video size={14} className="text-muted-foreground" />
                ) : (
                  <VideoOff size={14} className="text-destructive" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
