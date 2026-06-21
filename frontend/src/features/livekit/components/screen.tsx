"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LiveKitRoom,
  PreJoin,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { endMeetingAction } from "@/src/app/(main)/livekit/actions";
import { PreJoinScreen } from "./PreJoinScreen";
import { MeetingRoom } from "./MeetingRoom";

interface MeetingPageProps {
  token: string;
  room: string;
  isInstructor?: boolean;
}

export default function MeetingPage({
  token,
  room,
  isInstructor = false,
}: MeetingPageProps) {
  const router = useRouter();
  const [preJoinChoices, setPreJoinChoices] = useState<any>(undefined);

  const handleDisconnected = async () => {
    if (isInstructor) {
      try {
        await endMeetingAction(room);
      } catch (err) {
        console.error("Failed to end meeting:", err);
      }
    }
    router.replace(
      isInstructor ? "/dashboard-instructor" : "/dashboard-student"
    );
  };

  if (!preJoinChoices) {
    return (
      <PreJoinScreen
        onSubmit={(values) => setPreJoinChoices(values)}
        isInstructor={isInstructor}
      />
    );
  }

  return (
    <LiveKitRoom
      video={preJoinChoices.videoEnabled}
      audio={preJoinChoices.audioEnabled}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      connect={true}
      onDisconnected={handleDisconnected}
    >
      <ConnectionStateToast />
      <RoomAudioRenderer />
      <MeetingRoom isInstructor={isInstructor} room={room} />
    </LiveKitRoom>
  );
}
