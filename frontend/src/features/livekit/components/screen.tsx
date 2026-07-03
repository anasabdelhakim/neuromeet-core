"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { MeetingRoom } from "./MeetingRoom";

interface MeetingPageProps {
  token: string;
  room: string;
  isInstructor?: boolean;
  meetingTitle?: string;
  meetingPasscode?: string;
  meetingId?: string;
  isGuest?: boolean;
}

export default function MeetingPage({
  token,
  room,
  isInstructor = false,
  meetingTitle = "Instant Session",
  meetingPasscode = "443451",
  meetingId = room,
  isGuest = false,
}: MeetingPageProps) {
  const router = useRouter();

  const handleDisconnected = async () => {
    router.refresh();
    router.replace(
      isInstructor ? "/dashboard-instructor" : "/dashboard-student"
    );
  };

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      connect={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoCodec: "vp8",
        },
        videoCaptureDefaults: {
          resolution: { width: 640, height: 480, frameRate: 15 }, 
        },
      }}
      onDisconnected={handleDisconnected}
    >
      <ConnectionStateToast />
      <RoomAudioRenderer />
      <MeetingRoom 
        isInstructor={isInstructor} 
        room={room} 
        meetingTitle={meetingTitle}
        meetingPasscode={meetingPasscode}
        meetingId={meetingId}
        isGuest={isGuest}
      />
    </LiveKitRoom>
  );
}
