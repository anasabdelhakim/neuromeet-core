"use client";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { EngagementDashboard } from "./EngagementDashboard";
import { endMeetingAction } from "@/src/app/(main)/livekit/actions";

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
          <VideoConference />
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
