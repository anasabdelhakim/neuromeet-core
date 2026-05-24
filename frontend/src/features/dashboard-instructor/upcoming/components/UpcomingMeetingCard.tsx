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
      className={cn(
        "w-full rounded-lg p-5 flex flex-col gap-4 transition-all duration-300 transform-gpu hover:border-primary/50",
        isArrived
          ? "card-glass border backdrop-blur-md shadow-lg shadow-black/20"
          : isStartingSoon
            ? "bg-card-gradient border backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-card/25 border border-border shadow-none opacity-85 hover:opacity-100",
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
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 uppercase tracking-wider font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Soon
              </Badge>
            )}
            {isArrived && (
              <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 uppercase tracking-wider font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
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
