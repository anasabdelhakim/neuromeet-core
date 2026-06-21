"use client";

import { ControlBar, DisconnectButton } from "@livekit/components-react";
import { Activity, MessageSquare, PhoneOff, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";

interface MeetingControlsProps {
  activeTab: ActiveSidebarTab;
  isInstructor: boolean;
  onToggleTab: (tab: NonNullable<ActiveSidebarTab>) => void;
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function IconButton({ icon, label, active, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full transition-all duration-normal",
        active
          ? "bg-primary text-white"
          : "text-muted-foreground hover:text-white hover:bg-black-soft-muted"
      )}
    >
      {icon}
    </button>
  );
}

export function MeetingControls({
  activeTab,
  isInstructor,
  onToggleTab,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-card/80 backdrop-blur-md border border-white/10 p-2 px-4 rounded-[2.5rem] shadow-action-new-deep">
      <div className="flex items-center gap-1">
        <ControlBar
          controls={{ chat: false, leave: false, screenShare: true }}
        />
      </div>

      <DisconnectButton>
        <div className="flex items-center gap-2 bg-status-error hover:opacity-90 text-white rounded-full px-5 h-11 transition-all duration-normal cursor-pointer font-semibold text-sm">
          <PhoneOff size={17} />
          <span className="hidden sm:inline">Leave</span>
        </div>
      </DisconnectButton>

      <div className="flex items-center gap-1">
        {isInstructor && (
          <IconButton
            icon={<Activity size={19} />}
            label="Engagement"
            active={activeTab === "engagement"}
            onClick={() => onToggleTab("engagement")}
          />
        )}
        <IconButton
          icon={<Users size={19} />}
          label="People"
          active={activeTab === "participants"}
          onClick={() => onToggleTab("participants")}
        />
        <IconButton
          icon={<MessageSquare size={19} />}
          label="Chat"
          active={activeTab === "chat"}
          onClick={() => onToggleTab("chat")}
        />
      </div>
    </div>
  );
}
