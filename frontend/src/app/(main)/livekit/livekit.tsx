import MeetingPage from "@/src/features/livekit/components/screen";
import { getAuthCookies } from "@/src/lib/auth-cookies";
import { parseJwt } from "@/src/features/livekit/helpers/auth";
import { apiGet } from "@/src/lib/api-client";

export default async function Livekit(props: {
  searchParams: Promise<{ room?: string; user?: string; guest?: string }>;
}) {
  const params = await props.searchParams;
  const room = params?.room || "test-room";

  const { accessToken } = await getAuthCookies();
  const payload = accessToken ? parseJwt(accessToken) : null;
  const isInstructor = payload?.role === "INSTRUCTOR";

  const user = params?.user || payload?.name || payload?.email || `user-${Date.now()}`;

  let meetingTitle = "Instant Session";
  let meetingPasscode = "443451"; 
  let meetingId = room.startsWith("room-") ? room.replace(/^room-/, "") : room;
  let isGuest = params?.guest === "true" || false;

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

    try {
      const { apiPost } = await import("@/src/lib/api-client");
      const joinRes = await apiPost<any>(`/meetings/${meetingId}/join`, { passcode: meetingPasscode });
      if (joinRes.data && typeof joinRes.data.isGuest === "boolean") {
        isGuest = joinRes.data.isGuest;
      }
    } catch (joinErr) {
      console.warn("Participant join tracking notice:", joinErr);
    }
  } catch (e) {
    console.warn("Failed to fetch meeting details for joining info", e);
  }

  const backendUrl = process.env.NESTJS_URL || "http://127.0.0.1:4000/api/v1";
  const role = payload?.role || "STUDENT";
  const res = await fetch(
    `${backendUrl}/livekit/token?room=${room}&user=${encodeURIComponent(user)}&role=${role}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    let errorMessage = "Unable to join the meeting.";
    let errorDetail = "Please check your link and try again.";
    let errorHint = "";
    try {
      const errData = await res.json();
      const msg = (errData?.message || "").toLowerCase();
      if (msg.includes("not started") || msg.includes("has not started")) {
        errorMessage = "Meeting Not Started Yet";
        errorDetail = "The host hasn't started this session yet.";
        errorHint = "Please wait for the instructor to begin the meeting, then refresh this page.";
      } else if (msg.includes("ended") || msg.includes("no longer active") || msg.includes("cancelled")) {
        errorMessage = "Meeting Has Ended";
        errorDetail = "This session is no longer active.";
        errorHint = "Please check your dashboard for upcoming or rescheduled meetings.";
      } else if (msg.includes("not found")) {
        errorMessage = "Meeting Not Found";
        errorDetail = "This meeting link is invalid or has been removed.";
        errorHint = "Please verify the link or ask your instructor for a new one.";
      } else if (res.status === 401 || res.status === 403) {
        errorMessage = "Access Denied";
        errorDetail = "You are not authorized to join this meeting.";
        errorHint = "Make sure you are logged in with the correct account.";
      }
    } catch {}
    const dashboardUrl = "/dashboard-student";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#0a0a0f", color: "#fff", fontFamily: "Inter, sans-serif", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🚫</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "#f87171" }}>{errorMessage}</h1>
        <p style={{ color: "#94a3b8", marginBottom: "8px", maxWidth: "380px" }}>{errorDetail}</p>
        {errorHint && <p style={{ color: "#64748b", fontSize: "0.875rem", maxWidth: "360px", marginBottom: "24px" }}>{errorHint}</p>}
        <a href={dashboardUrl} style={{ marginTop: "8px", padding: "10px 24px", background: "#6366f1", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          ← Back to Dashboard
        </a>
      </div>
    );
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
      isGuest={isGuest}
    />
  );
}
