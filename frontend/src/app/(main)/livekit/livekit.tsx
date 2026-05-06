import MeetingPage from "@/src/features/livekit/components/screen";

export default async function Livekit(props: {
  searchParams: Promise<{ room?: string; user?: string }>;
}) {
  const params = await props.searchParams;
  // 1. Get room and user from URL, or use defaults
  const room = params?.room || "test-room";
  const user = params?.user || `user-10`;

  // 2. Fetch the token from your NestJS backend
  // Make sure your backend is running on localhost:4000
  const res = await fetch(
    `http://localhost:4000/api/v1/livekit/token?room=${room}&user=${user}`,
    { cache: "no-store" }, // Ensure we get a fresh token every time
  );

  if (!res.ok) {
    return <div>Failed to load LiveKit token. Is your backend running?</div>;
  }

  const data = await res.json();

  // 3. Pass the fetched token to your component
  return <MeetingPage token={data.token} />;
}
