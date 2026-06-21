"use client";

import { VideoConference } from "@livekit/components-react";
import { EngagementDashboard } from "./EngagementDashboard";

interface MeetingRoomProps {
  isInstructor: boolean;
  room: string;
}

export function MeetingRoom({ isInstructor, room }: MeetingRoomProps) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* LiveKit Default Responsive Video Conference */}
      <div className="flex-1 relative h-full">
        <VideoConference className="w-full h-full" />
      </div>

      {/* Instructor Engagement Sidebar */}
      {isInstructor && (
        <aside className="w-80 flex-shrink-0 flex flex-col bg-card border-l border-border h-full">
          <div className="flex items-center px-5 py-4 border-b border-border flex-shrink-0">
            <h2 className="text-sm font-semibold">Live Engagement</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <EngagementDashboard />
          </div>
        </aside>
      )}
    </div>
  );
}
