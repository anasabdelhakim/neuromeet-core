"use client";

import { useState } from "react";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
  Chat,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { X, Users } from "lucide-react";
import { EngagementDashboard } from "./EngagementDashboard";
import { ParticipantList } from "./ParticipantList";
import { MeetingControls } from "./MeetingControls";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";

function InstructorBadgedTile(props: any) {
  const trackRef = props.trackRef;
  const participant = trackRef?.participant;

  let isInstructor = false;
  try {
    if (participant?.metadata) {
      const meta = JSON.parse(participant.metadata);
      isInstructor = meta.role === "INSTRUCTOR";
    }
  } catch (_) {}

  return (
    <div className="relative w-full h-full">
      <ParticipantTile {...props} />
      {isInstructor && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black bg-opacity-70 backdrop-blur-sm border border-brand-cyan text-brand-cyan text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse inline-block" />
          Instructor
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  activeTab: ActiveSidebarTab;
  isInstructor: boolean;
  onClose: () => void;
}

function Sidebar({ activeTab, isInstructor, onClose }: SidebarProps) {
  const tabLabels: Record<NonNullable<ActiveSidebarTab>, string> = {
    chat: "In-call messages",
    participants: "People",
    engagement: "Live Engagement",
  };

  const participants = useParticipants();
  const participantCount = participants.length + 1;

  return (
    <aside className="absolute md:relative inset-y-0 right-0 z-50 w-full md:w-[360px] h-full bg-background/95 backdrop-blur-xl border-l border-border flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.15)] transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-base font-bold text-foreground">
          {activeTab ? tabLabels[activeTab] : ""}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Participant List Extra Actions */}
      {activeTab === "participants" && (
        <div className="p-4 flex items-center justify-between bg-muted/30 border-b border-border select-none">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Users size={18} />
            <span>{participantCount} Participants</span>
          </div>
          {isInstructor && (
            <button className="text-primary hover:bg-primary/10 hover:text-primary h-8 px-3 text-xs font-bold rounded-md transition-colors border border-primary/20">
              Mute All
            </button>
          )}
        </div>
      )}

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden flex flex-col bg-card">
        {activeTab === "chat" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-card ">
            <Chat />
          </div>
        )}
        {activeTab === "participants" && <ParticipantList />}
        {activeTab === "engagement" && isInstructor && (
          <div className="flex-1 overflow-y-auto p-3">
            <EngagementDashboard />
          </div>
        )}
      </div>
    </aside>
  );
}

interface MeetingRoomProps {
  isInstructor: boolean;
  room: string;
}

export function MeetingRoom({ isInstructor, room }: MeetingRoomProps) {
  const [activeTab, setActiveTab] = useState<ActiveSidebarTab>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false }
  );

  const toggleTab = (tab: NonNullable<ActiveSidebarTab>) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Top Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Main Video Area */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden relative bg-black select-none">
          <div className={cn(
            "w-full h-full max-w-[1600px] flex items-center justify-center transition-all duration-300",
            /* Grid Layout */
            "[&_.lk-grid-layout]:bg-transparent [&_.lk-grid-layout]:p-4 [&_.lk-grid-layout]:gap-3",
            "[&_.lk-focus-layout]:p-4 [&_.lk-focus-layout]:gap-3",
            
            /* Participant Tile */
            "[&_.lk-participant-tile]:rounded-2xl [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:bg-card [&_.lk-participant-tile]:border [&_.lk-participant-tile]:border-border [&_.lk-participant-tile]:transition-all [&_.lk-participant-tile]:duration-300",
            "[&_.lk-participant-tile[data-speaking='true']]:border-primary [&_.lk-participant-tile[data-speaking='true']]:ring-2 [&_.lk-participant-tile[data-speaking='true']]:ring-primary/50",
            
            /* Tile Metadata (Name/Badges) */
            "[&_.lk-participant-metadata]:bg-gradient-to-t [&_.lk-participant-metadata]:from-black/80 [&_.lk-participant-metadata]:to-transparent [&_.lk-participant-metadata]:p-4 [&_.lk-participant-metadata]:gap-2",
            "[&_.lk-participant-name]:text-sm [&_.lk-participant-name]:font-semibold [&_.lk-participant-name]:text-white [&_.lk-participant-name]:tracking-wide",
            
            /* Placeholders */
            "[&_.lk-placeholder]:bg-card"
          )}>
            <GridLayout tracks={tracks} style={{ height: "100%" }}>
              <InstructorBadgedTile />
            </GridLayout>
          </div>
        </main>

        {/* Sidebar on the right */}
        {activeTab && (
          <Sidebar
            activeTab={activeTab}
            isInstructor={isInstructor}
            onClose={() => setActiveTab(null)}
          />
        )}
      </div>

      {/* Bottom Control Bar */}
      <MeetingControls
        room={room}
        activeTab={activeTab}
        isInstructor={isInstructor}
        onToggleTab={toggleTab}
      />
    </div>
  );
}
