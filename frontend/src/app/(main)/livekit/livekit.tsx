import MeetingPage from "@/src/features/livekit/components/screen";
import { getAuthCookies } from "@/src/lib/auth-cookies";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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

  return <MeetingPage token={data.token} isInstructor={isInstructor} room={room} />;
}
