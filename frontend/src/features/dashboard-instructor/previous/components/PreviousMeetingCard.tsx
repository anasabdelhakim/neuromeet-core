import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/Avtars-meetings";
import { Clock, CheckCircle2, BarChart3, Play, Info } from "lucide-react";
import { PreviousMeeting } from "../types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";

interface PreviousMeetingCardProps {
  meeting: PreviousMeeting;
}

export function PreviousMeetingCard({ meeting }: PreviousMeetingCardProps) {
  // Assuming you will add avgEngagement to your PreviousMeeting type.
  // Using a fallback of 85 here just in case it's missing during your transition.
  const engagementScore = meeting.avgEngagement || 85;

  // Extracted Action Block for consistent mobile/desktop responsive rendering
  const ActionBlock = (
    <div className="flex w-full sm:w-auto items-center gap-3 flex-shrink-0">
      <div className="hidden sm:block">
        <AvatarChain />
      </div>
      <div className="flex flex-1 sm:flex-initial gap-2 w-full">
        <Button variant="outline" className="flex-1 sm:w-auto border rounded-medium">
          <BarChart3 size={16} className="text-primary-light mr-2" />
          Report
        </Button>
        {meeting.hasRecording && (
          <Button className="flex-1 sm:w-auto rounded-medium">
            <Play size={16} fill="currentColor" className="mr-2" />
            Play
          </Button>
        )}
      </div>
    </div>
  );

  // Extracted Engagement Bar to render it above buttons on mobile, and below on desktop
  const EngagementBar = (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs font-semibold">
        
        {/* Label with Info Popover */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>Avg Engagement</span>
          <Popover>
            <PopoverTrigger
              render={
                <button className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none" />
              }
            >
              <Info size={14} />
            </PopoverTrigger>
            <PopoverContent align="center" side="top" className="w-64 p-3 text-xs font-medium leading-relaxed">
              This metric represents the average engagement level of students during the session, calculated from active screen time, chat participation, and interaction.
            </PopoverContent>
          </Popover>
        </div>

        {/* Score Value */}
        <span className="text-status-success flex items-center gap-1">
          {engagementScore}% <span className="hidden sm:inline-block">High</span>
        </span>
      </div>
      
      {/* Progress Track */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-slow ease-standard"
          style={{ width: `${engagementScore}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full rounded-soft p-4 sm:p-5 flex flex-col gap-4 border transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover">
      
      {/* Row 1: Content (Left) & Desktop Actions (Right) */}
      <div className="flex items-start sm:items-center justify-between w-full gap-4">
        
        {/* Left Side: Meeting Info */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground truncate">
              {meeting.title}
            </CardTitle>
            <Badge className="bg-status-success-soft text-status-success border border-status-success-border hover:bg-status-success-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs py-0.5 px-2 flex items-center gap-1">
              <CheckCircle2 size={10} />
              Completed
            </Badge>
            {meeting.hasRecording && (
              <Badge className="bg-destructive-soft text-destructive border border-destructive-soft-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs py-0.5 px-2 flex">
                Recording Available
              </Badge>
            )}
          </div>
          
          <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-3 sm:gap-4 mt-1">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock size={16} className="text-primary-light" />
              <span>{meeting.dateTime}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-xs text-muted-foreground-muted hidden sm:inline-block">•</span>
              <span>{meeting.duration} Mins Duration</span>
            </div>
          </CardDescription>
        </div>

        {/* Right Side: Desktop Actions (Hidden on Mobile) */}
        <div className="hidden sm:flex">
          {ActionBlock}
        </div>
      </div>

      {/* Mobile Only: Engagement Bar (Rendered above buttons) */}
      <div className="sm:hidden w-full pt-1">
        {EngagementBar}
      </div>

      {/* Mobile Only: Actions Block (Rendered at the bottom) */}
      <div className="sm:hidden w-full pt-1">
        {ActionBlock}
      </div>

      {/* Desktop Only: Engagement Bar (Rendered at the bottom) */}
      <div className="hidden sm:block w-full pt-2">
        {EngagementBar}
      </div>
      
    </Card>
  );
}