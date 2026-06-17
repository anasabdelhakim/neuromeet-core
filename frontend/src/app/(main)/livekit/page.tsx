import { Suspense } from "react";
import Livekit from "./livekit";
import { Loader2, Video } from "lucide-react";

function MeetingLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-soft-subtle rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl aspect-square bg-brand-cyan opacity-10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary-soft-muted rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-card border border-border shadow-hard rounded-full flex items-center justify-center backdrop-blur-xl">
            <Video className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Initializing NeuroMeet AI...</h2>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
          <span className="text-sm font-medium">Connecting to secure video cluster</span>
        </div>
      </div>
    </div>
  );
}

export default async function LivekitWrapper({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; user?: string }>;
}) {
  return (
    <Suspense fallback={<MeetingLoadingScreen />}>
      <Livekit searchParams={searchParams} />
    </Suspense>
  );
}
