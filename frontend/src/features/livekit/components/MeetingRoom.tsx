"use client";

import { useState } from "react";
import {
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
  useTrackRefContext,
  Chat,
  DisconnectButton,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { EngagementDashboard } from "./EngagementDashboard";
import { ParticipantList } from "./ParticipantList";
import { MeetingControls } from "./MeetingControls";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";

function InstructorBadgedTile() {
  const trackRef = useTrackRefContext();
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
      <ParticipantTile />
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

  return (
    <aside className="absolute inset-y-0 right-0 z-50 w-full md:relative md:w-80 flex-shrink-0 flex flex-col bg-card border-l border-border shadow-2xl transition-all">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          {activeTab ? tabLabels[activeTab] : ""}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chat" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-card">
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
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden relative">
      {/* Main Video Area */}
      <main className="flex-1 relative bg-black overflow-hidden group">
        <div className={cn(
          "absolute inset-0",
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

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-300">
          <MeetingControls
            activeTab={activeTab}
            isInstructor={isInstructor}
            onToggleTab={toggleTab}
          />
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
  );
}
