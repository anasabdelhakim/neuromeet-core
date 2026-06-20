import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Play, Info } from "lucide-react";
import { StatusBar } from "@/src/features/dashboard-instructor/upcoming/components/StatusBar";
import { calculateMeetingStatus } from "@/src/features/dashboard-instructor/upcoming/helper/time-calc";
import { connection } from "next/server";

export async function DynamicStudentMeetingBadge({ dateTime }: { dateTime: string }) {
  await connection();
  const { isArrived, isStartingSoon } = calculateMeetingStatus(dateTime);

  if (isStartingSoon) {
    return (
      <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1.5"></span>
        Soon
      </Badge>
    );
  }

  if (isArrived) {
    return (
      <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse mr-1.5"></span>
        Live
      </Badge>
    );
  }

  return null;
}

export async function DynamicStudentMeetingActions({ dateTime }: { dateTime: string }) {
  await connection();
  const { isArrived } = calculateMeetingStatus(dateTime);

  if (isArrived) {
    return (
      <Button variant="live" className="w-full sm:w-auto flex-shrink-0">
        <Play size={16} fill="currentColor" className="mr-2" />
        Join Now
      </Button>
    );
  }

  return (
    <Button variant="ghost" className="w-full sm:w-auto border-border flex-shrink-0" disabled>
      <Info size={18} className="mr-2" />
      Not Started
    </Button>
  );
}

export async function DynamicStudentMeetingStatusBar({ dateTime, duration }: { dateTime: string; duration: number }) {
  await connection();
  const { isArrived, isStartingSoon } = calculateMeetingStatus(dateTime);
  const timeLabel = isArrived ? "Live" : isStartingSoon ? "Starting Soon" : "Later";

  return <StatusBar duration={duration} isArrived={isArrived} timeLabel={timeLabel} />;
}
