import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Play, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { calculateMeetingStatus } from "@/src/features/dashboard-instructor/upcoming/helper/time-calc";
import { StatusBar } from "@/src/features/dashboard-instructor/upcoming/components/StatusBar";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/avatars";
import { StudentUpcomingMeeting } from "../types/index";

interface Props {
  meeting: StudentUpcomingMeeting;
}

export function StudentUpcomingCard({ meeting }: Props) {
  const { isArrived: isLive, isStartingSoon } = calculateMeetingStatus(meeting.dateTime);

  const ActionButton = isLive ? (
    <Button variant="live" className="w-full sm:w-auto flex-shrink-0">
      <Play size={16} fill="currentColor" className="mr-2" />
      Join Now
    </Button>
  ) : (
    <Button variant="ghost" className="w-full sm:w-auto border-border flex-shrink-0" disabled>
      <Info size={18} className="mr-2" />
      Not Started
    </Button>
  );

  return (
    <Card
      variant={isLive ? "glass" : isStartingSoon ? "gradient" : "default"}
      className={cn(
        "w-full p-4 sm:p-5 flex flex-col gap-4 transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover",
        isLive || isStartingSoon
          ? "border backdrop-blur-md shadow-hard shadow-black-20"
          : "bg-black-soft-subtle border shadow-none opacity-80 hover:opacity-100"
      )}
    >
      {/* Row 1: Meeting Info (Left) & Desktop Actions (Right) */}
      <div className="flex items-start sm:items-center justify-between w-full gap-4">
        
        {/* Meeting Info: Always Visible */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground max-sm:max-w-60 truncate">
              {meeting.title}
            </CardTitle>
          </div>
          <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
            <span className="whitespace-nowrap">{new Date(meeting.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            {isStartingSoon && (
              <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1.5"></span>
                Soon
              </Badge>
            )}
            {isLive && (
              <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse mr-1.5"></span>
                Live
              </Badge>
            )}
          </CardDescription>
        </div>

        {/* Desktop Actions: Hidden on Mobile */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <AvatarChain/>
          {ActionButton}
        </div>
      </div>

      {/* Mobile Only: Progress Bar */}
      <div className="sm:hidden px-1 w-full">
        <StatusBar
          duration={60}
          isArrived={isLive}
          timeLabel={isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"}
        />
      </div>

      {/* Mobile Only: Action Button */}
      <div className="sm:hidden w-full">
        {ActionButton}
      </div>

      {/* Desktop Only: Progress Bar */}
      <div className="hidden sm:block px-1 -mt-1">
        <StatusBar
          duration={60}
          isArrived={isLive}
          timeLabel={isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"}
        />
      </div>
    </Card>
  );
}
