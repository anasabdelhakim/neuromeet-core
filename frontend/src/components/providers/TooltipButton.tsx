"use client";
import { ReactNode } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
interface TooltipButtonProps {
  children: ReactNode;
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}
export function TooltipButton({
  children,
  label,
  variant,
  className,
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <Button {...props} variant={variant} className={className}>
            {children}
          </Button>
        )}
      />
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
