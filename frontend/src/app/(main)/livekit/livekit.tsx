import MeetingPage from "@/src/features/livekit/components/screen";
import { getAuthCookies } from "@/src/lib/auth-cookies";
import { parseJwt } from "@/src/features/livekit/helpers/auth";
import { apiGet } from "@/src/lib/api-client";

export default async function Livekit(props: {
  searchParams: Promise<{ room?: string; user?: string }>;
}) {
  const params = await props.searchParams;
  const room = params?.room || "test-room";

  // Extract real user identity from the JWT cookie
  const { accessToken } = await getAuthCookies();
  const payload = accessToken ? parseJwt(accessToken) : null;
  const isInstructor = payload?.role === "INSTRUCTOR";
  // Use the user's real name or email as their LiveKit identity
  const user = params?.user || payload?.name || payload?.email || `user-${Date.now()}`;

  let meetingTitle = "Instant Session";
  let meetingPasscode = "443451"; 
  let meetingId = room.startsWith("room-") ? room.replace(/^room-/, "") : room;

  try {
    const res = await apiGet<any>("/meetings");
    const allMeetings = res.data || [];
    const found = allMeetings.find((m: any) => m.livekitRoomName === room || m.id === room || m.id === meetingId);
    if (found) {
      meetingTitle = found.title || meetingTitle;
      meetingPasscode = found.passcode || meetingPasscode;
      meetingId = found.id || meetingId;
    } else {
      const singleRes = await apiGet<any>(`/meetings/${meetingId}`);
      if (singleRes.data) {
        meetingTitle = singleRes.data.title || meetingTitle;
        meetingPasscode = singleRes.data.passcode || meetingPasscode;
        meetingId = singleRes.data.id || meetingId;
      }
    }

    // Root Lifecycle Fix: Explicitly invoke the join API so the database accurately registers the participant
    try {
      const { apiPost } = await import("@/src/lib/api-client");
      await apiPost(`/meetings/${meetingId}/join`, { passcode: meetingPasscode });
    } catch (joinErr) {
      console.warn("Participant join tracking notice:", joinErr);
    }
  } catch (e) {
    console.warn("Failed to fetch meeting details for joining info", e);
  }

  // Fetch the token from the NestJS backend
  const backendUrl = process.env.NESTJS_URL || "http://127.0.0.1:4000/api/v1";
  const role = payload?.role || "STUDENT";
  const res = await fetch(
    `${backendUrl}/livekit/token?room=${room}&user=${encodeURIComponent(user)}&role=${role}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return <div>Failed to load LiveKit token. Is your backend running?</div>;
  }

  const data = await res.json();

  return (
    <MeetingPage 
      token={data.token} 
      isInstructor={isInstructor} 
      room={room} 
      meetingTitle={meetingTitle}
      meetingPasscode={meetingPasscode}
      meetingId={meetingId}
    />
  );
}
