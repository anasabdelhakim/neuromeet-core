"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { MoreVertical, Copy, CheckSquare, Pencil, Trash2, Share2, SquareUserRound, Loader } from "lucide-react";
import { ShareMeetingModal } from "./ShareMeetingModal";
import { EditMeetingModal } from "./EditMeetingModal";
import { deleteMeetingAction, endMeetingAction } from "../../home/actions/meeting-actions";

type PopoverVariant = "active" | "history" | "previous";

interface MeetingActionsPopoverProps {
  title?: string;
  dateTime?: string;
  meetingId: string;
  passcode?: string;
  status?: string;
  variant?: PopoverVariant;
  onEdit?: () => void;
  onCopyInvitation?: () => void;
  onShareToGroup?: () => void;
  groups?: any[];
  participantsCount?: number;
  isPast?: boolean; // ضفنا دي عشان نستقبلها جاهزة وممكن منستخدمهاش لو مش محتاجينها
}

export function MeetingActionsPopover({
  title = "Meeting",
  dateTime,
  meetingId,
  passcode,
  status = "SCHEDULED",
  variant = "active",
  onEdit,
  onCopyInvitation,
  onShareToGroup,
  groups = [],
  participantsCount = 0,
  isPast = false, // القيمة الافتراضية
}: MeetingActionsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => setIsCopied(false), 200);
    }
  };

  const handleCopy = async () => {
      try {
        const joinUrl = `${window.location.origin}/meeting/join/${meetingId}`;
        const displayPasscode = passcode && passcode.startsWith("$argon2id") 
          ? "[Hidden - Please re-share to reset]" 
          : passcode || "Not generated yet";
        const copyText = `Join my meeting: ${title}\nLink: ${joinUrl}\nPasscode: ${displayPasscode}`;
        await navigator.clipboard.writeText(copyText);
        setIsCopied(true);
        onCopyInvitation?.();
      } catch (err) {
        console.error("Failed to copy link", err);
      }
  };

  // شيلنا الـ useEffect والـ Date.now() تماماً من هنا
  const isLive = status === "LIVE";
  
  // بنعتمد على الـ props الجاهزة بس عشان نعرض زرار End بدل Delete
  const isLiveOrActive = isLive || status === "STARTED" || status === "IN_PROGRESS" || participantsCount > 0 || (isPast && variant !== "previous") || variant === "history";

  const handleDeleteOrEnd = () => {
    startDeleteTransition(async () => {
      if (isLiveOrActive) {
        await endMeetingAction(meetingId);
      } else {
        await deleteMeetingAction(meetingId);
      }
      setIsDeleteDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger render={      <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-white-soft-deep hover:text-white hover:bg-white-soft-muted"
          >
            <MoreVertical size={18} />
          </Button>}>
    
        </PopoverTrigger>

        <PopoverContent align="end" className="w-48 p-1 flex flex-col gap-0.5 z-50">
          {variant === "active" && (
            <>
              <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal" onClick={handleCopy} disabled={isCopied}>
                {isCopied ? (
                  <>
                    <CheckSquare size={16} className="mr-2 text-status-success" />
                    <span className="text-status-success">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2 text-muted-foreground" />
                    <span>Copy Join Link</span>
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal" onClick={() => { setIsOpen(false); setIsEditModalOpen(true); }}>
                <Pencil size={16} className="mr-2 text-muted-foreground" />
                Edit Meeting
              </Button>
              <div className="h-px bg-border my-1 w-full" />
              <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm font-normal" onClick={() => { setIsOpen(false); setIsShareModalOpen(true); }}>
                <Share2 size={16} className="mr-2 text-muted-foreground" />
                Share to Group
              </Button>
              <div className="h-px bg-border my-1 w-full" />
            </>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={() => { setIsOpen(false); setIsDeleteDialogOpen(true); }}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : (isLiveOrActive ? <SquareUserRound size={16} className="mr-2" /> : <Trash2 size={16} className="mr-2" />)}
            {isDeleting ? (isLiveOrActive ? "Ending..." : "Deleting...") : (isLiveOrActive ? "End Meeting" : "Delete Meeting")}
          </Button>
        </PopoverContent>
      </Popover>

      <ShareMeetingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        meetingId={meetingId}
        meetingTitle={title}
        groups={groups}
      />

      <EditMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        meetingId={meetingId}
        initialTitle={title}
        initialDateTime={dateTime || ""}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!isDeleting) setIsDeleteDialogOpen(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isLiveOrActive ? "End Meeting?" : "Delete Meeting?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isLiveOrActive && (
                <span className="text-destructive font-medium block mb-2">
                  Warning: Active or Past Session.
                </span>
              )}
              {isLiveOrActive 
                ? "This will instantly end the meeting, remove all participants, stop any active session, and move the meeting to history. This cannot be undone. Are you sure?"
                : "This will permanently delete the scheduled meeting. This action cannot be undone. Are you sure?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrEnd}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> {isLiveOrActive ? "Ending..." : "Deleting..."}
                </>
              ) : (
                isLiveOrActive ? "End Meeting" : "Delete Meeting"
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}