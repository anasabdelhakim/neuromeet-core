import { Video, Loader } from "lucide-react";
import { PasscodeForm } from "./PasscodeForm";
import { Suspense } from "react";

export async function generateStaticParams() {
  return [{ meetingId: "dummy" }];
}

async function MeetingDataLoader({ paramsPromise }: { paramsPromise: Promise<{ meetingId: string }> }) {
  const resolvedParams = await paramsPromise;
  const meetingId = resolvedParams.meetingId;

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-md">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="relative w-20 h-20 bg-card border border-border shadow-hard rounded-full flex items-center justify-center backdrop-blur-xl">
          <Video className="h-9 w-9 text-primary" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">
        Join Meeting
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-xs">
        Enter the passcode shared by your instructor to join this session.
      </p>

      {/* Passcode Form */}
      <PasscodeForm meetingId={meetingId} meetingTitle="Meeting" />

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground mt-8 text-center opacity-60">
        The passcode was shared via email or by your instructor.
      </p>
    </div>
  );
}

export default function JoinMeetingPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background relative overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-soft-subtle rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl aspect-square bg-brand-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px] relative z-10"><Loader className="w-8 h-8 animate-spin text-primary" /></div>}>
        <MeetingDataLoader paramsPromise={params} />
      </Suspense>
    </div>
  );
}
