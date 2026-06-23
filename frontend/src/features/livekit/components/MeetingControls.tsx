"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react";
import { 
  MessageSquare, 
  PhoneOff, 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";

interface MeetingControlsProps {
  room: string;
  activeTab: ActiveSidebarTab;
  isInstructor: boolean;
  onToggleTab: (tab: NonNullable<ActiveSidebarTab>) => void;
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

function IconButton({ icon, label, active, danger, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-normal shadow-sm hover:scale-[1.05] active:scale-[0.98] shrink-0",
        danger
          ? "bg-status-error text-white hover:bg-status-error/90"
          : active
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
      )}
    >
      {icon}
    </button>
  );
}

export function MeetingControls({
  room,
  activeTab,
  isInstructor,
  onToggleTab,
}: MeetingControlsProps) {
  const { 
    isMicrophoneEnabled, 
    isCameraEnabled, 
    isScreenShareEnabled, 
    localParticipant 
  } = useLocalParticipant();

  const participants = useParticipants();
  const participantCount = participants.length + 1;
  const roomContext = useRoomContext();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const formatTime = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCurrentTime(formatTime());
    const id = setInterval(() => setCurrentTime(formatTime()), 15_000);
    return () => clearInterval(id);
  }, []);

  const toggleMicrophone = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  };

  const handleLeave = async () => {
    try {
      await roomContext.disconnect();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const readableRoom = room
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <footer className="h-16 sm:h-20 bg-background/95 backdrop-blur-xl border-t border-border px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none overflow-hidden w-full">
      {/* Left Zone: Time and Session Name */}
      <div className="hidden md:flex flex-col justify-center min-w-[150px] max-w-[250px]">
        <div className="text-sm sm:text-base font-semibold text-foreground tracking-tight tabular-nums">
          {currentTime}
        </div>
        <div className="text-xs text-muted-foreground truncate font-medium">
          {readableRoom}
        </div>
      </div>

      {/* Center Zone: Hardware Controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-3.5 shrink-0 mx-auto md:mx-0 max-w-full">
        <IconButton
          icon={isMicrophoneEnabled ? <Mic size={16} className="sm:w-[19px] sm:h-[19px]" /> : <MicOff size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
          danger={!isMicrophoneEnabled}
          onClick={toggleMicrophone}
        />
        <IconButton
          icon={isCameraEnabled ? <Video size={16} className="sm:w-[19px] sm:h-[19px]" /> : <VideoOff size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isCameraEnabled ? "Stop Camera" : "Start Camera"}
          danger={!isCameraEnabled}
          onClick={toggleCamera}
        />
        <IconButton
          icon={isScreenShareEnabled ? <MonitorOff size={16} className="sm:w-[19px] sm:h-[19px]" /> : <Monitor size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isScreenShareEnabled ? "Stop Presenting" : "Present Screen"}
          active={isScreenShareEnabled}
          onClick={toggleScreenShare}
        />

        <button
          onClick={handleLeave}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/10 hover:!bg-destructive border border-white/5 hover:border-status-error text-white rounded-full w-9 h-9 sm:w-auto sm:px-5 sm:h-11 transition-all duration-normal cursor-pointer font-bold text-xs sm:text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <PhoneOff size={14} className="sm:w-[16px] sm:h-[16px]" />
          <span className="hidden sm:inline">Leave</span>
        </button>

        {/* Mobile-only Toggles to fit screen */}
        <div className="flex md:hidden items-center gap-2 border-l border-white/10 pl-2">
          <div className="relative">
            <IconButton
              icon={<Users size={16} />}
              label="People"
              active={activeTab === "participants"}
              onClick={() => onToggleTab("participants")}
            />
            <span className="absolute -top-1 -right-1 text-[8px] sm:text-[10px] w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-primary text-white flex items-center justify-center rounded-full border border-background font-bold pointer-events-none select-none">
              {participantCount}
            </span>
          </div>

          <IconButton
            icon={<MessageSquare size={16} />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => onToggleTab("chat")}
          />

          {isInstructor && (
            <IconButton
              icon={<Sparkles size={16} />}
              label="Live Engagement"
              active={activeTab === "engagement"}
              onClick={() => onToggleTab("engagement")}
            />
          )}
        </div>
      </div>

      {/* Right Zone: Sidebar Toggles (Desktop only) */}
      <div className="hidden md:flex justify-end items-center gap-3 min-w-[150px] max-w-[250px]">
        <div className="relative">
          <IconButton
            icon={<Users size={19} />}
            label="People"
            active={activeTab === "participants"}
            onClick={() => onToggleTab("participants")}
          />
          <span className="absolute -top-1 -right-1 text-[10px] w-4.5 h-4.5 bg-primary text-white flex items-center justify-center rounded-full border-2 border-background font-bold shadow-md pointer-events-none select-none">
            {participantCount}
          </span>
        </div>

        <div className="relative">
          <IconButton
            icon={<MessageSquare size={19} />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => onToggleTab("chat")}
          />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border border-background pointer-events-none" />
        </div>

        {isInstructor && (
          <IconButton
            icon={<Sparkles size={19} />}
            label="Live Engagement"
            active={activeTab === "engagement"}
            onClick={() => onToggleTab("engagement")}
          />
        )}
      </div>
    </footer>
  );
}
