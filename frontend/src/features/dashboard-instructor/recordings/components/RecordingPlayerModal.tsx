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
  // Google Drive preview URL conversion
  const embedUrl = gDriveViewLink ? gDriveViewLink.replace("/view", "/preview") : "";

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      disablePointerDismissal={true}
    >
      {/* 
        Changed from fixed height (85vh) to a fluid width-based layout. 
        Added p-0 to remove default padding and bg-black/95 for a cinematic feel.
      */}
      <DialogContent className="max-w-5xl w-[95vw] md:w-[90vw] p-0 border border-white/10 bg-black/95 backdrop-blur-3xl shadow-2xl gap-0 overflow-hidden rounded-xl">
        
        <DialogHeader className="p-4 md:p-5 border-b border-white/10 bg-black">
          <DialogTitle className="text-white font-medium text-base md:text-lg truncate pr-6">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* 
          Aspect-video ensures the iframe scales perfectly on mobile without stretching 
          or leaving massive empty gaps.
        */}
        <div className="w-full relative aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 absolute inset-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white/40 text-sm font-medium">
              No playable video URL available.
            </div>
          )}
        </div>
        
        {/* Sleek information footer */}
        <div className="p-4 md:p-5 bg-black/90">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 text-xs md:text-sm text-white/70 flex items-start gap-3 transition-colors hover:bg-white/10">
            <Info className="text-primary w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-medium">Note:</strong> If Google Drive displays <em>"This video file is still being processed for playback"</em>, it means Google is optimizing the video for web streaming. You can still download the full file immediately from the dashboard!
            </p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
