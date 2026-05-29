"use client";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function MeetingPage({ token }: { token: string }) {
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
      {/* المكون ده بيرسم شبكة الكاميرات وشريط الأدوات بالكامل أوتوماتيك */}
      <VideoConference />

      {/* المكون ده عشان تسمع أصوات الناس التانية */}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
