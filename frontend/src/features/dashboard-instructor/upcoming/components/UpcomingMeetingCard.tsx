import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/Avtars-meetings";
import { AlarmClock } from "lucide-react";
import { UpcomingMeeting } from "../types";
import { StatusBar } from "./StatusBar";
import { ActionsButton } from "./ActionsButton";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { calculateMeetingStatus } from "../helper/time-calc";

interface UpcomingMeetingCardProps {
  meeting: UpcomingMeeting;
}

export  function UpcomingMeetingCard({
  meeting,
}: UpcomingMeetingCardProps) {
  
  const { isArrived, isStartingSoon, timeLabel } = calculateMeetingStatus(
    meeting.dateTime,
  );
  return (
    <Card
      variant={isArrived ? "glass" : (isStartingSoon ? "gradient" : "default")}
      className={cn(
        "w-full p-5 flex flex-col gap-4 transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover",
        isArrived || isStartingSoon
          ? "border backdrop-blur-md shadow-hard shadow-black-20"
          : "bg-black-soft-subtle border border-border shadow-none opacity-85 hover:opacity-100",
      )}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Side: Content */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-bold text-foreground">
              {meeting.title}
            </CardTitle>
          </div>
          <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5">
              <AlarmClock size={16} className="text-primary-light" />
              <span>{meeting.dateTime.replace("T", " ")}</span>
            </div>
            {isStartingSoon && (
              <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse"></span>
                Soon
              </Badge>
            )}
            {isArrived && (
              <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse"></span>
                Live
              </Badge>
            )}
          </CardDescription>
        </div>

        {/* Right Side: Actions & Avatars */}
        <div className="flex items-center gap-2">
          <AvatarChain />
          <ActionsButton isArrived={isArrived} />
        </div>
      </div>

      {/* Bottom: Progress Bar */}
      <div className="px-1 -mt-4">
        <StatusBar
          duration={meeting.duration}
          isArrived={isArrived}
          timeLabel={timeLabel}
        />
      </div>
    </Card>
  );
}
