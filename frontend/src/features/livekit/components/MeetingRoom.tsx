"use client";
import { useState, useEffect } from "react";
import {
  GridLayout,
  ParticipantTile,
  useTracks,
  Chat,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { X, Users, Copy, Check } from "lucide-react";
import { EngagementDashboard } from "./EngagementDashboard";
import { useEngagementData } from '@/src/features/livekit/hooks/useEngagementData';
import { useCopyFeedback } from "@/src/hooks/useCopyFeedback";
import { ParticipantList } from "./ParticipantList";
import { MeetingControls } from "./MeetingControls";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";
function InstructorBadgedTile(props: any) {
  const trackRef = props.trackRef;
  const participant = trackRef?.participant;
  let isInstructor = false;
  try {
    if (participant?.metadata) {
      const meta = JSON.parse(participant.metadata);
      isInstructor = meta.role === "INSTRUCTOR";
    }
  } catch (_) {}
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 shadow-lg">
      <ParticipantTile {...props} className="w-full h-full" />
      {isInstructor && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black bg-opacity-70 backdrop-blur-sm border border-brand-cyan text-brand-cyan text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse inline-block" />
          Instructor
        </div>
      )}
    </div>
  );
}
interface SidebarProps {
  activeTab: ActiveSidebarTab;
  isInstructor: boolean;
  onClose: () => void;
  meetingTitle?: string;
  meetingPasscode?: string;
  meetingId?: string;
  participantCount: number;
}
function Sidebar({ activeTab, isInstructor, onClose, meetingTitle, meetingPasscode, meetingId, participantCount }: SidebarProps) {
  const tabLabels: Record<NonNullable<ActiveSidebarTab>, string> = {
    chat: "In-call messages",
    participants: "People",
    engagement: "Live Engagement",
  };
  return (
    <aside 
      className={cn(
        "absolute md:relative inset-y-0 right-0 z-50 h-full bg-background/95 backdrop-blur-xl border-border flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.15)] transition-all duration-300", 
        activeTab ? "w-full md:w-[360px] translate-x-0 border-l" : "w-0 translate-x-full border-l-0 opacity-0 overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border min-w-[360px]">
        <h2 className="text-base font-bold text-foreground">
          {activeTab ? tabLabels[activeTab] : ""}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Participants Header */}
      <div className={cn("p-4 items-center justify-between bg-muted/30 border-b border-border select-none min-w-[360px]", activeTab === "participants" ? "flex" : "hidden")}>
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Users size={18} />
          <span>{participantCount} Participants</span>
        </div>
        {isInstructor && (
          <button className="text-primary hover:bg-primary/10 hover:text-primary h-8 px-3 text-xs font-bold rounded-md transition-colors border border-primary/20">
            Mute All
          </button>
        )}
      </div>

      {/* Content Areas */}
      <div className="flex-1 overflow-hidden flex flex-col bg-card min-w-[360px]">
        <div className={cn("flex-1 overflow-hidden flex flex-col bg-card", activeTab !== "chat" && "hidden")}>
          <Chat />
        </div>
        <div className={cn("flex-1 overflow-hidden flex flex-col", activeTab !== "participants" && "hidden")}>
          <ParticipantList meetingTitle={meetingTitle} meetingPasscode={meetingPasscode} meetingId={meetingId} />
        </div>
        {isInstructor && (
          <div className={cn("flex-1 overflow-y-auto p-3", activeTab !== "engagement" && "hidden")}>
            <EngagementDashboard />
          </div>
        )}
      </div>
    </aside>
  );
}
function EngagementSync({ meetingId }: { meetingId: string }) {
  useEngagementData(meetingId);
  return null;
}
interface MeetingRoomProps {
  isInstructor: boolean;
  room: string;
  meetingTitle?: string;
  meetingPasscode?: string;
  meetingId?: string;
  isGuest?: boolean;
}
export function MeetingRoom({ isInstructor, room, meetingTitle = "Instant Session", meetingPasscode = "443451", meetingId = room, isGuest = false }: MeetingRoomProps) {
  const [activeTab, setActiveTab] = useState<ActiveSidebarTab>(null);
  const [showJoiningInfoModal, setShowJoiningInfoModal] = useState(false);
  const { copiedKey, copy } = useCopyFeedback(2000);
  const participantCount = useParticipants().length;
  useEffect(() => {
    if (isInstructor && meetingId) {
      const storageKey = `dismissed_joining_info_${meetingId}`;
      setShowJoiningInfoModal(!sessionStorage.getItem(storageKey));
    }
  }, [isInstructor, meetingId]);
  const handleDismissJoiningInfo = () => {
    if (meetingId) {
      sessionStorage.setItem(`dismissed_joining_info_${meetingId}`, "true");
    }
    setShowJoiningInfoModal(false);
  };
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const toggleTab = (tab: NonNullable<ActiveSidebarTab>) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };
  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-background text-foreground overflow-hidden font-sans relative">
      {isInstructor && meetingId && <EngagementSync meetingId={meetingId} />}
      <div className="flex-1 flex overflow-hidden relative w-full">
        <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden relative bg-black select-none">
          <div className={cn(
            "w-full h-full max-w-[1600px] flex items-center justify-center transition-all duration-300",
            
            "[&_.lk-grid-layout]:w-full [&_.lk-grid-layout]:h-full [&_.lk-grid-layout]:grid [&_.lk-grid-layout]:grid-cols-[repeat(var(--lk-col-count,1),minmax(0,1fr))] [&_.lk-grid-layout]:grid-rows-[repeat(var(--lk-row-count,1),minmax(0,1fr))] [&_.lk-grid-layout]:gap-4 [&_.lk-grid-layout]:p-2",
            "[&_.lk-focus-layout]:w-full [&_.lk-focus-layout]:h-full [&_.lk-focus-layout]:grid [&_.lk-focus-layout]:gap-4 [&_.lk-focus-layout]:p-2",
            
            "[&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_.lk-participant-tile]:relative [&_.lk-participant-tile]:flex [&_.lk-participant-tile]:items-center [&_.lk-participant-tile]:justify-center [&_.lk-participant-tile]:overflow-hidden [&_.lk-participant-tile]:bg-black [&_.lk-participant-tile]:transition-all [&_.lk-participant-tile]:duration-300 [&_.lk-participant-tile]:rounded-2xl",
            "[&_.lk-participant-tile[data-speaking='true']]:border-primary [&_.lk-participant-tile[data-speaking='true']]:ring-2 [&_.lk-participant-tile[data-speaking='true']]:ring-primary/50",
            "[&_.lk-participant-tile_video]:w-full [&_.lk-participant-tile_video]:h-full [&_.lk-participant-tile_video]:!object-contain",
            
            "[&_.lk-participant-metadata]:absolute [&_.lk-participant-metadata]:bottom-0 [&_.lk-participant-metadata]:inset-x-0 [&_.lk-participant-metadata]:bg-gradient-to-t [&_.lk-participant-metadata]:from-black/90 [&_.lk-participant-metadata]:to-transparent [&_.lk-participant-metadata]:p-4 [&_.lk-participant-metadata]:flex [&_.lk-participant-metadata]:items-center [&_.lk-participant-metadata]:gap-2 [&_.lk-participant-metadata]:z-10",
            "[&_.lk-participant-name]:text-sm [&_.lk-participant-name]:font-semibold [&_.lk-participant-name]:text-white [&_.lk-participant-name]:tracking-wide",
            
            "[&_.lk-placeholder]:bg-card [&_.lk-placeholder]:w-full [&_.lk-placeholder]:h-full [&_.lk-placeholder]:flex [&_.lk-placeholder]:items-center [&_.lk-placeholder]:justify-center"
          )}>
            <GridLayout tracks={tracks} style={{ width: "100%", height: "100%" }}>
              <InstructorBadgedTile />
            </GridLayout>
          </div>
          {}
          {showJoiningInfoModal && (
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 w-[calc(100vw-32px)] max-w-[320px] sm:max-w-[340px] bg-card/95 border border-border rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in fade-in-50 slide-in-from-bottom-5 duration-300 select-text">
              <div className="flex items-center justify-between pb-2.5 border-b border-border">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-brand-cyan" />
                  Your Joining Info
                </h3>
                <button
                  onClick={handleDismissJoiningInfo}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="py-3 space-y-3 text-xs font-medium text-muted-foreground">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Meeting Title</p>
                  <p className="text-white font-semibold truncate text-xs select-all">{meetingTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Join Link</p>
                  <div className="mt-1 flex items-center justify-between gap-2 p-1.5 bg-black-soft-muted rounded-lg border border-border group/link">
                    <span className="font-mono text-[11px] text-primary-light truncate select-all">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/meeting/join/${meetingId}`}
                    </span>
                    <button
                      onClick={() => {
                        copy(`${window.location.origin}/meeting/join/${meetingId}`, "link");
                      }}
                      title="Copy Link"
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-muted/50 group-hover/link:bg-muted text-muted-foreground hover:!text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === "link" ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Passcode</p>
                  <div className="mt-1 flex items-center justify-between gap-2 p-1.5 bg-black-soft-muted rounded-lg border border-border group/passcode">
                    <span className="text-white font-mono font-bold tracking-widest text-xs select-all">
                      {meetingPasscode}
                    </span>
                    <button
                      onClick={() => {
                        copy(meetingPasscode, "passcode");
                      }}
                      title="Copy Passcode"
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-muted/50 group-hover/passcode:bg-muted text-muted-foreground hover:!text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === "passcode" ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  copy(`Join my meeting: ${meetingTitle}\nLink: ${window.location.origin}/meeting/join/${meetingId}\nPasscode: ${meetingPasscode}`, "all");
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 rounded-lg text-xs transition-all shadow-sm mt-1"
              >
                {copiedKey === "all" ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
                <span>{copiedKey === "all" ? "Copied Joining Info!" : "Copy Joining Info"}</span>
              </button>
            </div>
          )}
        </main>
        <Sidebar
          activeTab={activeTab}
          isInstructor={isInstructor}
          onClose={() => setActiveTab(null)}
          meetingTitle={meetingTitle}
          meetingPasscode={meetingPasscode}
          meetingId={meetingId}
          participantCount={participantCount}
        />
      </div>
      {}
      <MeetingControls
        room={room}
        activeTab={activeTab}
        isInstructor={isInstructor}
        onToggleTab={toggleTab}
        meetingId={meetingId}
        isGuest={isGuest}
        participantCount={participantCount}
      />
    </div>
  );
}
