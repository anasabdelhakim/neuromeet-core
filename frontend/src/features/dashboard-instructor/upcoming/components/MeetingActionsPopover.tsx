// MeetingActionsPopover.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { MoreVertical, Copy, CheckSquare } from "lucide-react";

interface MeetingActionsPopoverProps {
  title: string;
  dateTime: string;
}

export function MeetingActionsPopover({ title, dateTime }: MeetingActionsPopoverProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setIsCopied(false);
      }, 300);
    }
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
      
      <PopoverContent align="end" className="w-40 p-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-medium transition-all duration-normal"
          onClick={() => setIsCopied(true)}
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
      </PopoverContent>
    </Popover>
  );
}