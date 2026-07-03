"use client";

import { useEffect, useState, useRef } from "react";
import { useLocalParticipant, useParticipants, useRoomContext } from "@livekit/components-react";
import { 
  MessageSquare, 
  PhoneOff, 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Sparkles,
  Disc,
  Maximize,
  Minimize
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ActiveSidebarTab } from "../types/meeting-types";

import { leaveMeetingAction } from "@/src/features/dashboard-instructor/home/actions/meeting-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

interface MeetingControlsProps {
  room: string;
  activeTab: ActiveSidebarTab;
  isInstructor: boolean;
  onToggleTab: (tab: NonNullable<ActiveSidebarTab>) => void;
  meetingId?: string;
  isGuest?: boolean;
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  recording?: boolean;
  onClick: () => void;
}

function IconButton({ icon, label, active, danger, recording, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-normal shadow-sm hover:scale-[1.05] active:scale-[0.98] shrink-0",
        recording
          ? "bg-destructive text-white hover:bg-destructive/90 animate-pulse ring-4 ring-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          : danger
          ? "bg-status-error text-white hover:bg-status-error/90"
          : active
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
      )}
    >
      {icon}
    </button>
  );
}

export function MeetingControls({
  room,
  activeTab,
  isInstructor,
  onToggleTab,
  meetingId,
  isGuest = false,
}: MeetingControlsProps) {
  const { 
    isMicrophoneEnabled, 
    isCameraEnabled, 
    isScreenShareEnabled, 
    localParticipant 
  } = useLocalParticipant();

  const participants = useParticipants();
  const participantCount = participants.length;
  const roomContext = useRoomContext();

  const [currentTime, setCurrentTime] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const thumbnailRef = useRef<string | null>(null);
  const [allowStudentRecording, setAllowStudentRecording] = useState(true);

  useEffect(() => {
    const formatTime = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCurrentTime(formatTime());
    const id = setInterval(() => setCurrentTime(formatTime()), 15_000);

    if (isGuest) {
      setTimeout(() => {
        setShowGuestAlert(true);
      }, 2000);
    }

    const checkPermission = async () => {
      try {
        const { getStudentRecordingPermissionAction } = await import("@/src/features/dashboard-instructor/recordings/actions/recordings-actions");
        const allowed = await getStudentRecordingPermissionAction();
        setAllowStudentRecording(allowed);
      } catch (err) {
        console.error("Failed to check server recording permission:", err);
      }
    };
    checkPermission();
    window.addEventListener("recordingPermissionChange", checkPermission);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      clearInterval(id);
      window.removeEventListener("recordingPermissionChange", checkPermission);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Failed to toggle fullscreen:", err);
    }
  };

  const uploadRecording = async (chunks: Blob[], durationSeconds: number) => {
    if (chunks.length === 0) return;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const totalSize = blob.size;
    
    console.log(`Starting Direct Resumable Chunking upload. Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    try {
      // Step 1: Initialize Resumable Session
      const initRes = await fetch(`/api/recordings/${room}/init`, { method: 'POST' });
      const { uploadUrl } = await initRes.json();
      
      if (!uploadUrl) throw new Error("Failed to get Google Drive uploadUrl");

      // Step 1.5: Upload the Thumbnail now that the DB row exists
      if (thumbnailRef.current) {
        fetch(`/api/recordings/${room}/thumbnail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnail: thumbnailRef.current }),
        }).catch(err => console.error("Thumbnail upload failed:", err));
      }

      // Step 2: Slice and Upload Chunks
      const CHUNK_SIZE = 256 * 1024 * 8; // Exactly 2MB
      let byteOffset = 0;
      let isFinal = false;
      let finalData = null;

      while (byteOffset < totalSize) {
        const end = Math.min(byteOffset + CHUNK_SIZE, totalSize);
        const chunkBlob = blob.slice(byteOffset, end);
        isFinal = end === totalSize;

        console.log(`Uploading chunk: ${byteOffset}-${end}/${totalSize}`);

        const chunkRes = await fetch(
          `/api/recordings/${room}/chunk?uploadUrl=${encodeURIComponent(uploadUrl)}&byteOffset=${byteOffset}&totalSize=${totalSize}&isFinal=${isFinal}&duration=${durationSeconds}`,
          {
            method: 'POST',
            body: chunkBlob,
            headers: { 'Content-Type': 'application/octet-stream' }
          }
        );

        if (!chunkRes.ok) throw new Error(`Chunk upload failed with status ${chunkRes.status}`);

        if (isFinal) {
          finalData = await chunkRes.json();
        }

        byteOffset = end;
      }

      console.log("Recording upload completed successfully:", finalData);
    } catch (err) {
      console.error("Direct Resumable Chunking failed:", err);
    }
  };

  const captureThumbnail = (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const video = document.createElement("video");
      video.srcObject = new MediaStream([videoTrack]);
      video.autoplay = true;
      video.muted = true;

      video.onloadeddata = () => {
        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            thumbnailRef.current = dataUrl;
          }
          video.srcObject = null;
        }, 2000); // Wait 2 seconds for the screen content to fully render
      };
    } catch (err) {
      console.error("Failed to capture thumbnail:", err);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        // 1. Capture the display (Chrome tab/screen) along with system/tab audio (other participants)
        // PERF: Limited frame rate to 15-24fps and resolution to 720p/1080p to vastly reduce CPU load and prevent lag.
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: "browser",
            frameRate: { ideal: 15, max: 24 },
            width: { max: 1920, ideal: 1280 },
            height: { max: 1080, ideal: 720 }
          },
          audio: true,
        });

        // 2. Capture the instructor's local microphone
        let micStream: MediaStream | null = null;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        } catch (micErr) {
          console.warn("Microphone access not available or denied for recording mix:", micErr);
        }

        // 3. Merge audio tracks using Web Audio API so both instructor mic and participant audio are recorded together!
        const tracks: MediaStreamTrack[] = [displayStream.getVideoTracks()[0]];

        const displayAudioTracks = displayStream.getAudioTracks();
        const micAudioTracks = micStream ? micStream.getAudioTracks() : [];

        if (displayAudioTracks.length > 0 && micAudioTracks.length > 0) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();

          const displaySource = audioContext.createMediaStreamSource(new MediaStream([displayAudioTracks[0]]));
          displaySource.connect(destination);

          const micSource = audioContext.createMediaStreamSource(new MediaStream([micAudioTracks[0]]));
          micSource.connect(destination);

          tracks.push(destination.stream.getAudioTracks()[0]);
        } else if (displayAudioTracks.length > 0) {
          tracks.push(displayAudioTracks[0]);
        } else if (micAudioTracks.length > 0) {
          tracks.push(micAudioTracks[0]);
        }

        const combinedStream = new MediaStream(tracks);
        streamRef.current = combinedStream;
        chunksRef.current = [];

        let mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        // PERF: Reduced videoBitsPerSecond to 1.5 Mbps to significantly reduce VP8 CPU encoding overhead
        const mediaRecorder = new MediaRecorder(combinedStream, { 
          mimeType,
          videoBitsPerSecond: 1500000 // 1.5 Mbps
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
          uploadRecording(chunksRef.current, duration);
          setIsRecording(false);
          alert("Recording stopped. Uploading to Google Drive in the background...");
          if (micStream) {
            micStream.getTracks().forEach((t) => t.stop());
          }
        };

        // Handle user clicking "Stop sharing" on the browser bar directly
        displayStream.getVideoTracks()[0].onended = () => {
          mediaRecorder.stop();
        };

        recordingStartTimeRef.current = Date.now();
        mediaRecorder.start(1000);
        captureThumbnail(combinedStream);
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  const toggleMicrophone = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  };

  const handleLeave = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    try {
      if (meetingId || room) {
        await leaveMeetingAction(meetingId || room);
      }
      await roomContext.disconnect();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const readableRoom = room
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <footer className="h-16 sm:h-20 bg-background/95 backdrop-blur-xl border-t border-border px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none overflow-hidden w-full">
      {/* Left Zone: Time and Session Name */}
      <div className="hidden md:flex flex-col justify-center min-w-[150px] max-w-[250px]">
        <div className="text-sm sm:text-base font-semibold text-foreground tracking-tight tabular-nums">
          {currentTime}
        </div>
        <div className="text-xs text-muted-foreground truncate font-medium">
          {readableRoom}
        </div>
      </div>

      {/* Center Zone: Hardware Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 mx-auto md:mx-0 max-w-full overflow-x-auto flex-nowrap py-1 px-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <IconButton
          icon={isMicrophoneEnabled ? <Mic size={16} className="sm:w-[19px] sm:h-[19px]" /> : <MicOff size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
          danger={!isMicrophoneEnabled}
          onClick={toggleMicrophone}
        />
        <IconButton
          icon={isCameraEnabled ? <Video size={16} className="sm:w-[19px] sm:h-[19px]" /> : <VideoOff size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isCameraEnabled ? "Stop Camera" : "Start Camera"}
          danger={!isCameraEnabled}
          onClick={toggleCamera}
        />
        <IconButton
          icon={isScreenShareEnabled ? <MonitorOff size={16} className="sm:w-[19px] sm:h-[19px]" /> : <Monitor size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isScreenShareEnabled ? "Stop Presenting" : "Present Screen"}
          active={isScreenShareEnabled}
          onClick={toggleScreenShare}
        />

        {(isInstructor || (allowStudentRecording && !isGuest)) && (
          <IconButton
            icon={<Disc size={16} className="sm:w-[19px] sm:h-[19px]" />}
            label={isRecording ? "Stop Recording" : "Start Recording"}
            recording={isRecording}
            onClick={toggleRecording}
          />
        )}

        <IconButton
          icon={isFullscreen ? <Minimize size={16} className="sm:w-[19px] sm:h-[19px]" /> : <Maximize size={16} className="sm:w-[19px] sm:h-[19px]" />}
          label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          active={isFullscreen}
          onClick={toggleFullscreen}
        />

        <button
          onClick={handleLeave}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/10 hover:!bg-destructive border border-white/5 hover:border-status-error text-white rounded-full w-9 h-9 sm:w-auto sm:px-5 sm:h-11 transition-all duration-normal cursor-pointer font-bold text-xs sm:text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <PhoneOff size={14} className="sm:w-[16px] sm:h-[16px]" />
          <span className="hidden sm:inline">Leave</span>
        </button>

        {/* Mobile-only Toggles to fit screen */}
        <div className="flex md:hidden items-center gap-2 border-l border-white/10 pl-2">
          <div className="relative">
            <IconButton
              icon={<Users size={16} />}
              label="People"
              active={activeTab === "participants"}
              onClick={() => onToggleTab("participants")}
            />
            <span className="absolute -top-1 -right-1 text-[8px] sm:text-[10px] w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-primary text-white flex items-center justify-center rounded-full border border-background font-bold pointer-events-none select-none">
              {participantCount}
            </span>
          </div>

          <IconButton
            icon={<MessageSquare size={16} />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => onToggleTab("chat")}
          />

          {isInstructor && (
            <IconButton
              icon={<Sparkles size={16} />}
              label="Live Engagement"
              active={activeTab === "engagement"}
              onClick={() => onToggleTab("engagement")}
            />
          )}
        </div>
      </div>

      {/* Right Zone: Sidebar Toggles (Desktop only) */}
      <div className="hidden md:flex justify-end items-center gap-3 min-w-[150px] max-w-[250px]">
        <div className="relative">
          <IconButton
            icon={<Users size={19} />}
            label="People"
            active={activeTab === "participants"}
            onClick={() => onToggleTab("participants")}
          />
          <span className="absolute -top-1 -right-1 text-[10px] w-4.5 h-4.5 bg-primary text-white flex items-center justify-center rounded-full border-2 border-background font-bold shadow-md pointer-events-none select-none">
            {participantCount}
          </span>
        </div>

        <div className="relative">
          <IconButton
            icon={<MessageSquare size={19} />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => onToggleTab("chat")}
          />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border border-background pointer-events-none" />
        </div>

        {isInstructor && (
          <IconButton
            icon={<Sparkles size={19} />}
            label="Live Engagement"
            active={activeTab === "engagement"}
            onClick={() => onToggleTab("engagement")}
          />
        )}
      </div>
    </footer>

      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Guest Notice</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-[15px]">
              You are currently joining this meeting as a <strong>Guest</strong> because you are not enrolled in the associated group.
              <br/><br/>
              Please note that you will <strong>not</strong> be able to save recordings or view upcoming meeting cards on your dashboard for this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowGuestAlert(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
