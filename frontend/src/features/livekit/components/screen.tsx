"use client";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { EngagementDashboard } from "./EngagementDashboard";

interface MeetingPageProps {
  token: string;
  /** Pass true for the instructor view to show the engagement side-panel */
  isInstructor?: boolean;
}

export default function MeetingPage({ token, isInstructor = false }: MeetingPageProps) {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh" }}
      connect={true}
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
