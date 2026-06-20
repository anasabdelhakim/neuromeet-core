import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Play, NotebookPen } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { calculateMeetingStatus } from "../helper/time-calc";
import { connection } from "next/server";

export async function DynamicMeetingBadge({ dateTime }: { dateTime: string }) {
  await connection();
  const { isArrived, isStartingSoon } = calculateMeetingStatus(dateTime);

  if (isStartingSoon) {
    return (
      <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1"></span>
        Soon
      </Badge>
    );
  }

  if (isArrived) {
    return (
      <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse mr-1"></span>
        Live
      </Badge>
    );
  }

  return null;
}

export async function DynamicMeetingActions({ dateTime }: { dateTime: string }) {
  await connection();
  const { isArrived } = calculateMeetingStatus(dateTime);

  return (
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
    </div>
  );
}

export async function DynamicMeetingStatusBar({ dateTime, duration }: { dateTime: string; duration: number }) {
  await connection();
  const { isArrived, timeLabel } = calculateMeetingStatus(dateTime);

  return <StatusBar duration={duration} isArrived={isArrived} timeLabel={timeLabel} />;
}
