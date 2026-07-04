"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { dummyRecordings } from "../constants/dummy-recordings";
import { RecordingDTO, deleteRecordingAction } from "../actions/recordings-actions";
import { RecordingPlayerModal } from "./RecordingPlayerModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/src/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Clock, Play, Trash2Icon, Loader, Disc } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

const ActionButton = ({ children, variant = "outline", className, onClick, disabled }: any) => (
  <Button 
    variant={variant} 
    size="icon" 
    className={`h-10 w-10 rounded-hard ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
);

export const RecordingsList = ({ recordings = [], isInstructor = true }: { recordings?: RecordingDTO[]; isInstructor?: boolean }) => {
  const displayRecordings = recordings;

  if (displayRecordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-border/50 rounded-xl bg-black-soft-subtle/30">
        <Disc size={48} className="text-muted-foreground mb-4 opacity-40 animate-pulse" />
        <p className="text-muted-foreground font-medium">No recordings found.</p>
        <p className="text-muted-foreground text-sm mt-1 opacity-70">
          When you record a meeting session, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
      {displayRecordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} isInstructor={isInstructor} />
      ))}
    </div>
  );
};

export function RecordingCard({ recording, isInstructor = true }: { recording: RecordingDTO; isInstructor?: boolean }) {
  const router = useRouter();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [progressText, setProgressText] = useState("Processing...");
  const [currentStatus, setCurrentStatus] = useState(recording.status);

  useEffect(() => {
    if (currentStatus !== "PROCESSING") return;

    const sseUrl = `/api/recordings/${recording.meetingId}/progress`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "complete") {
          setProgressText("Completed (100%)");
          setCurrentStatus("COMPLETED");
          eventSource.close();
          // Silently refresh server components to fetch the final duration
          router.refresh();
        } else if (data.status === "streaming" || data.status === "finalizing") {
          if (data.totalBytes && data.totalBytes > 0) {
            const percent = Math.min(100, Math.round((data.bytesUploaded / data.totalBytes) * 100));
            setProgressText(`Chunk ${data.chunksUploaded || 1} (${percent}%)`);
          } else {
            setProgressText(`Uploading Chunk ${data.chunksUploaded || 1}...`);
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE progress", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentStatus, recording.meetingId]);

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteRecordingAction(recording.id);
      setIsDeleteDialogOpen(false);
    });
  };

  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds) return "0:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Card variant="gradient" className="py-0 cursor-pointer hover:scale-[1.02] transition-transform duration-normal ease-standard group" onClick={() => setIsPlayerOpen(true)}>
        <div className="aspect-video overflow-hidden rounded-t-soft relative">
          <Image
            src={recording.image || "/noVideo-found.webp"}
            alt={recording.title}
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black-soft-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-normal ease-standard">
            <Play className="text-white w-10 h-10 fill-white" />
          </div>

          <Badge className="absolute z-20 top-1 left-2 flex items-center gap-1 bg-custom-gray border-border shadow-hard">
            <span className="relative flex h-2 w-2 mr-0.5 ">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>{currentStatus === "PROCESSING" ? progressText : "Record"}</span>
          </Badge>
          <Badge className="absolute z-20 bottom-1 right-2 flex items-center gap-1 bg-custom-gray border-border shadow-hard rounded-hard tracking-wider">
            <Clock size={12} />
            <span>{formatDuration(recording.duration)}</span>
          </Badge>
        </div>
        <CardContent>
          <CardTitle>{recording.title}</CardTitle>
          <CardDescription className="my-2">{recording.dateTime || "Recently recorded"}</CardDescription>

          <div className="flex gap-2 mt-3 border-t border-border py-3 px-0 justify-between items-center w-full">
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <ActionButton label="Delete recording" variant="destructive" className="rounded-hard" onClick={() => setIsDeleteDialogOpen(true)} disabled={isDeleting}>
                {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2Icon size={18} />}
              </ActionButton>
            </div>

            <Button 
              className="rounded-medium gap-2" 
              onClick={() => currentStatus !== "PROCESSING" && setIsPlayerOpen(true)}
              disabled={currentStatus === "PROCESSING"}
            >
              {currentStatus === "PROCESSING" ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {progressText}
                </>
              ) : (
                <>
                  <Play size={18} />
                  Play
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecordingPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        title={recording.title}
        gDriveViewLink={recording.gDriveViewLink}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the recording file from Google Drive and remove it from your dashboard. This action cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete Recording
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}