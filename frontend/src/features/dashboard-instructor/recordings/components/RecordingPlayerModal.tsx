"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Info } from "lucide-react";
interface RecordingPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  gDriveViewLink: string;
}
export function RecordingPlayerModal({ isOpen, onClose, title, gDriveViewLink }: RecordingPlayerModalProps) {
  const embedUrl = gDriveViewLink.replace("/view", "/preview");
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open, details: any) => {
        if (!open) {
          if (details?.reason === 'focusOut') return;
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-5xl md:max-w-[90vw] xl:max-w-[85vw] h-[85vh] flex flex-col p-4 rounded-soft border border-border bg-card backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full rounded-soft overflow-hidden bg-black relative mt-2">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 absolute inset-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
              No playable video URL available.
            </div>
          )}
        </div>
        <div className="bg-custom-gray border border-border rounded-soft p-3 text-xs text-muted-foreground mt-4 flex items-center gap-2">
          <Info size={18} className="text-primary shrink-0" />
          <span>
            <strong>Note:</strong> If Google Drive displays &quot;This video file is still being processed for playback&quot;, it means Google is currently optimizing the video for web streaming. You can still download the full file immediately using the download button on the card!
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
