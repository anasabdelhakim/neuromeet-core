"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { MoreVertical, Copy, CheckSquare, Pencil, Trash2, Share2 } from "lucide-react";
import { ShareMeetingModal } from "./ShareMeetingModal";

type PopoverVariant = "active" | "history";

interface MeetingActionsPopoverProps {
  title?: string;
  dateTime?: string;
  meetingId: string;
  passcode?: string;
  variant?: PopoverVariant;
  onEdit?: () => void;
  onCopyInvitation?: () => void;
  onShareToGroup?: () => void;
  groups?: any[];
}

export function MeetingActionsPopover({
  title = "Meeting",
  dateTime,
  meetingId,
  passcode,
  variant = "active",
  onEdit,
  onCopyInvitation,
  onShareToGroup,
  groups = [],
}: MeetingActionsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  // Define the deletion logic here or call a Server Action
  const handleDelete = async () => {
    console.log(`Deleting meeting with ID: ${meetingId}`);
    // Example: await deleteMeetingAction(meetingId);
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-white-soft-deep hover:text-white hover:bg-white-soft-muted"
            >
              <MoreVertical size={18} />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="w-48">
          {variant === "active" && (
            <>
              <DropdownMenuItem onClick={handleCopy} disabled={isCopied}>
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
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.()}>
                <Pencil size={16} className="mr-2 text-muted-foreground" />
                Edit Meeting
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsShareModalOpen(true)}>
                <Share2 size={16} className="mr-2 text-muted-foreground" />
                Share to Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 size={16} className="mr-2" />
            Delete Meeting
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareMeetingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        meetingId={meetingId}
        meetingTitle={title}
        groups={groups}
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All data will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete Meeting</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
