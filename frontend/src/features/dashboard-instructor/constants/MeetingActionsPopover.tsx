"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { MoreVertical, Copy, CheckSquare, Pencil, Trash2 } from "lucide-react";

type PopoverVariant = "active" | "previous";

interface MeetingActionsPopoverProps {
  meetingId: string; // Pass the ID here
  title: string;
  dateTime: string;
  variant?: PopoverVariant;
  onEdit?: () => void;
  onCopyInvitation?: () => void;
}

export function MeetingActionsPopover({
  meetingId,
  variant = "active",
  onEdit,
  onCopyInvitation,
}: MeetingActionsPopoverProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => setIsCopied(false), 300);
    }
  };

  const handleCopy = () => {
    setIsCopied(true);
    onCopyInvitation?.();
  };

  // Define the deletion logic here or call a Server Action
  const handleDelete = async () => {
    console.log(`Deleting meeting with ID: ${meetingId}`);
    // Example: await deleteMeetingAction(meetingId);
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-white-soft-deep hover:text-white hover:bg-white/10"
          />
        }
      >
        <MoreVertical size={18} />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-44 p-1">
        {variant === "active" && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium transition-all duration-fast"
              onClick={handleCopy}
              disabled={isCopied}
            >
              {isCopied ? (
                <>
                  <CheckSquare size={16} className="mr-2 text-status-success" />
                  <span className="text-status-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2 text-white-soft-deep" />
                  Copy Invitation
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium transition-all duration-fast"
              onClick={() => onEdit?.()}
            >
              <Pencil size={16} className="mr-2 text-white-soft-deep" />
              Edit Meeting
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-medium transition-all duration-fast text-status-error hover:text-destructive-foreground hover:bg-destructive hover:font-semibold"
          onClick={handleDelete}
        >
          <Trash2 size={16} className="mr-2" />
          Delete Meeting
        </Button>
      </PopoverContent>
    </Popover>
  );
}