"use client";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
  useTrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { EngagementDashboard } from "./EngagementDashboard";
import { endMeetingAction } from "@/src/app/(main)/livekit/actions";

// --- CUSTOM TILE TO SHOW INSTRUCTOR BADGE ---
function CustomParticipantTile() {
  const trackRef = useTrackRefContext();
  const participant = trackRef?.participant;
  
  let isInstructor = false;
  try {
    if (participant?.metadata) {
      const meta = JSON.parse(participant.metadata);
      isInstructor = meta.role === "INSTRUCTOR";
    }
  } catch (e) {
    // ignore parse errors
  }

  return (
    <ParticipantTile>
      {isInstructor && (
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-[100] shadow-md border border-primary-light">
          👑 Instructor
        </div>
      )}
    </ParticipantTile>
  );
}

// --- CUSTOM VIDEO CONFERENCE LAYOUT ---
function CustomVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [], onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <div className="flex-1 overflow-hidden p-2">
        <GridLayout tracks={tracks} style={{ height: '100%' }}>
          <CustomParticipantTile />
        </GridLayout>
      </div>
      <div className="w-full flex-shrink-0">
        <ControlBar />
      </div>
    </div>
  );
}

interface MeetingPageProps {
  token: string;
  room: string;
  /** Pass true for the instructor view to show the engagement side-panel */
  isInstructor?: boolean;
}

export default function MeetingPage({ token, room, isInstructor = false }: MeetingPageProps) {
  const router = useRouter();

  const handleDisconnected = async () => {
    // If the instructor leaves, we should gracefully shut down the AI Bot
    if (isInstructor) {
      try {
        await endMeetingAction(room);
      } catch (err) {
        console.error("Failed to recall bot:", err);
      }
    }
    
    router.replace(isInstructor ? "/dashboard-instructor/test-meeting" : "/dashboard-student");
  };

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh" }}
      connect={true}
      onDisconnected={handleDisconnected}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Main video grid — takes remaining width */}
        <div className="flex-1 min-w-0">
          <CustomVideoConference />
          <RoomAudioRenderer />
        </div>

        {/* Instructor-only engagement side-panel */}
        {isInstructor && (
          <aside className="w-72 flex-shrink-0 border-l border-border bg-card overflow-y-auto p-3">
            <EngagementDashboard />
          </aside>
        )}
      </div>
    </LiveKitRoom>
  );
}
