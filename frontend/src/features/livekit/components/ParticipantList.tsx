"use client";

import { useState } from "react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, Copy, Check, ChevronDown, ChevronUp, Info, UserX } from "lucide-react";
import { kickParticipantAction } from "../actions/livekit-actions";
import { useCopyFeedback } from "@/src/hooks/useCopyFeedback";

interface ParticipantListProps {
  meetingTitle?: string;
  meetingPasscode?: string;
  meetingId?: string;
}

export function ParticipantList({ meetingTitle = "Instant Session", meetingPasscode = "443451", meetingId = "test-room" }: ParticipantListProps) {
  const participants = useParticipants();
  const { copiedKey, copy } = useCopyFeedback(2000);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const room = useRoomContext();

  const handleKick = async (identity: string) => {
    if (confirm(`Are you sure you want to kick ${identity}?`)) {
      await kickParticipantAction(room.name, identity);
    }
  };

  let localIsInstructor = false;
  try {
    if (room.localParticipant.metadata) {
      const meta = JSON.parse(room.localParticipant.metadata);
      localIsInstructor = meta.role === "INSTRUCTOR";
    }
  } catch (_) {}

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      {localIsInstructor && (
        <div className="border-b border-border bg-black-soft-subtle/50 flex-shrink-0 select-text">
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="w-full p-4 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-white transition-colors select-none cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Info size={14} className="text-brand-cyan" />
              Meeting Joining Info
            </span>
            {isInfoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isInfoExpanded && (
            <div className="px-4 pb-4 pt-1 space-y-3 animate-in fade-in-50 duration-200">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium">Link:</span>
                  <div className="mt-1 flex items-center justify-between gap-2 p-2 bg-black-soft-muted rounded-md border border-border group/link">
                    <span className="font-mono text-primary-light truncate select-all">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/meeting/join/${meetingId}`}
                    </span>
                    <button
                      onClick={() => {
                        copy(`${window.location.origin}/meeting/join/${meetingId}`, "link");
                      }}
                      title="Copy Link"
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-muted/50 group-hover/link:bg-muted text-muted-foreground hover:!text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === "link" ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Passcode:</span>
                  <div className="mt-1 flex items-center justify-between gap-2 p-2 bg-black-soft-muted rounded-md border border-border group/passcode">
                    <span className="font-mono font-bold text-white tracking-widest select-all">
                      {meetingPasscode}
                    </span>
                    <button
                      onClick={() => {
                        copy(meetingPasscode, "passcode");
                      }}
                      title="Copy Passcode"
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-muted/50 group-hover/passcode:bg-muted text-muted-foreground hover:!text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === "passcode" ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  copy(`Join my meeting: ${meetingTitle}\nLink: ${window.location.origin}/meeting/join/${meetingId}\nPasscode: ${meetingPasscode}`, "all");
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-white border border-border font-bold py-2 rounded-lg text-xs transition-colors shadow-sm mt-1"
              >
                {copiedKey === "all" ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                <span>{copiedKey === "all" ? "Copied Joining Info!" : "Copy Joining Info"}</span>
              </button>
            </div>
          )}
        </div>
      )}

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

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
                  {p.isMicrophoneEnabled ? <Mic size={14} /> : <MicOff size={14} className="text-destructive" />}
                  {p.isCameraEnabled ? <Video size={14} /> : <VideoOff size={14} className="text-destructive" />}
                </div>

                {}
                {localIsInstructor && !isInstructor && p.identity !== room.localParticipant.identity && (
                  <button 
                    onClick={() => handleKick(p.identity)}
                    title="Kick Student"
                    className="p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive rounded-md transition-colors"
                  >
                    <UserX size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
