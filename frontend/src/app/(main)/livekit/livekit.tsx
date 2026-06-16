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
  // 1. Get room and user from URL, or use defaults
  const room = params?.room || "test-room";
  const user = params?.user || `user-10`;

  // Determine if current user is an instructor by decoding our JWT cookie
  const { accessToken } = await getAuthCookies();
  const payload = accessToken ? parseJwt(accessToken) : null;
  const isInstructor = payload?.role === "INSTRUCTOR";

  // 2. Fetch the token from your NestJS backend
  const backendUrl = process.env.NESTJS_URL || "http://127.0.0.1:4000/api/v1";
  const res = await fetch(
    `${backendUrl}/livekit/token?room=${room}&user=${user}`,
    { cache: "no-store" }, // Ensure we get a fresh token every time
  );

  if (!res.ok) {
    return <div>Failed to load LiveKit token. Is your backend running?</div>;
  }

  const data = await res.json();

  // 3. Pass the fetched token to your component
  return <MeetingPage token={data.token} isInstructor={isInstructor} />;
}
