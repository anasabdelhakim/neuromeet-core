import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AlarmClock, Play, NotebookPen } from "lucide-react";
import { UpcomingMeeting } from "../types";
import { StatusBar } from "./StatusBar";
import { cn } from "@/src/lib/utils";
import { calculateMeetingStatus } from "../helper/time-calc";
import { MeetingActionsPopover } from "./MeetingActionsPopover";
import { AvatarChain } from "../../constants/avatars";

interface UpcomingMeetingCardProps {
  meeting: UpcomingMeeting;
}

export function UpcomingMeetingCard({ meeting }: UpcomingMeetingCardProps) {
  const { isArrived, isStartingSoon, timeLabel } = calculateMeetingStatus(
    meeting.dateTime
  );

  const ActionBlock = (
    <div className="flex w-full sm:w-auto items-center gap-2 flex-shrink-0">
      <div className="flex flex-1 sm:flex-initial gap-2">
        {!isArrived && (
          <Button variant="outline" className="flex-1 sm:w-auto border-border">
            <NotebookPen size={16} className="mr-2 hidden sm:inline-block" />
            Prepare
          </Button>
        )}

        {isArrived ? (
          <Button variant="live" className="flex-1 sm:w-auto">
            <Play size={16} fill="currentColor" className="mr-2" />
            Join Now
          </Button>
        ) : (
          <Button variant="default" className="flex-1 sm:w-auto">
            Start
          </Button>
        )}
      </div>

      {/* We inject our extracted Client Component here. 
        It handles its own interactivity while this parent component remains a Server Component.
      */}
      
    </div>
  );

  return (
    <Card
      variant={isArrived ? "glass" : isStartingSoon ? "gradient" : "default"}
      className={cn(
        "w-full p-4 sm:p-5 flex flex-col gap-4 transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover",
        isArrived || isStartingSoon
          ? "border backdrop-blur-md shadow-hard shadow-black-20"
          : "bg-black-soft-subtle border border-border shadow-none opacity-85 hover:opacity-100"
      )}
    >
      
      <div className="flex items-start sm:items-center justify-between w-full gap-4">
        <div className="flex w-full justify-between">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg font-bold max-sm:max-w-60 text-foreground truncate">
              {meeting.title}
            </CardTitle>
          </div>
          <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <AlarmClock size={16} className="text-primary-light" />
              <span>{meeting.dateTime.replace("T", " ")}</span>
            </div>
            {isStartingSoon && (
              <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1"></span>
                Soon
              </Badge>
            )}
            {isArrived && (
              <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse mr-1"></span>
                Live
              </Badge>
            )}
          </CardDescription>
        </div>

        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <AvatarChain />
          {ActionBlock}
        </div>
      </div>
      <MeetingActionsPopover title={meeting.title} dateTime={meeting.dateTime} meetingId={meeting.id} variant="active" />


</div>

      <div className="sm:hidden w-full px-1">
        <StatusBar
          duration={meeting.duration}
          isArrived={isArrived}
          timeLabel={timeLabel}
        />
      </div>

      <div className="sm:hidden w-full pt-1">
        {ActionBlock}
      </div>

      <div className="hidden sm:block px-1 -mt-2">
        <StatusBar
          duration={meeting.duration}
          isArrived={isArrived}
          timeLabel={timeLabel}
        />
      </div>
    </Card>
  );
}