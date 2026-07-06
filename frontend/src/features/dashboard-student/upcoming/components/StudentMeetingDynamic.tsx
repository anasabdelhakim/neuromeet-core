import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Play, Info } from "lucide-react";
import { StatusBar } from "@/src/features/dashboard-instructor/upcoming/components/StatusBar";
import { calculateMeetingStatus } from "@/src/features/dashboard-instructor/upcoming/helper/time-calc";
import { connection } from "next/server";
import { buttonVariants } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { JoinMeetingButton } from "./JoinMeetingButton";
import { studentNavigateToJoinAction } from "../actions/student-meeting-actions";

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

export async function DynamicStudentMeetingActions({ dateTime, meetingId }: { dateTime: string; meetingId: string }) {
  await connection();
  const { isArrived } = calculateMeetingStatus(dateTime);
  const joinAction = studentNavigateToJoinAction.bind(null, meetingId);

  return (
    <div className="flex w-full sm:w-auto items-center gap-2 flex-shrink-0">
      <div className="flex w-full sm:flex-initial gap-2">
        {isArrived ? (
          <form action={joinAction} className="w-full sm:w-auto">
            <JoinMeetingButton />
          </form>
        ) : (
          <Button variant="outline" className="w-full sm:w-auto text-muted-foreground opacity-50 cursor-not-allowed" disabled>
            Starting Soon
          </Button>
        )}
      </div>
    </div>
  );
}

export async function DynamicStudentMeetingStatusBar({ dateTime, duration }: { dateTime: string; duration: number }) {
  await connection();
  const { isArrived, timeLabel } = calculateMeetingStatus(dateTime);

  return <StatusBar duration={duration} isArrived={isArrived} timeLabel={timeLabel} dateTime={dateTime} />;
}
