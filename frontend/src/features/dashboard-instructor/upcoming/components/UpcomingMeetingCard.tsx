import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AlarmClock } from "lucide-react";
import { UpcomingMeeting } from "../types";
import { MeetingActionsPopover } from "./MeetingActionsPopover";
import { calculateMeetingStatus } from "../helper/time-calc";
import { AvatarChain } from "../../constants/avatars";
import { Suspense } from "react";
import { 
  DynamicMeetingBadge, 
  DynamicMeetingActions, 
  DynamicMeetingStatusBar 
} from "./MeetingDynamic";

interface UpcomingMeetingCardProps {
  meeting: UpcomingMeeting;
  groups: any[];
}

export function UpcomingMeetingCard({ meeting, groups }: UpcomingMeetingCardProps) {
  const { isArrived, isStartingSoon } = calculateMeetingStatus(meeting.dateTime);
  const variant = isArrived ? "glass" : isStartingSoon ? "gradient" : "default";

  return (
    <Card
      variant={variant}
      className="w-full rounded-soft p-4 sm:p-5 flex flex-col gap-4 border transition-all duration-normal ease-standard transform-gpu"
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
                <span>{meeting.date}</span>
                <span className="opacity-50 mx-1">•</span>
                <span className="whitespace-nowrap">{meeting.time}</span>
              </div>
              
              <Suspense fallback={<div className="w-12 h-5 bg-muted rounded animate-pulse" />}>
                <DynamicMeetingBadge dateTime={meeting.dateTime} />
              </Suspense>
            </CardDescription>
          </div>

          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
            <AvatarChain />
            <Suspense fallback={<div className="w-24 h-10 bg-muted rounded animate-pulse" />}>
              <DynamicMeetingActions dateTime={meeting.dateTime} meetingId={meeting.id} />
            </Suspense>
          </div>
        </div>
        <MeetingActionsPopover title={meeting.title} dateTime={meeting.dateTime} meetingId={meeting.id} passcode={meeting.passcode} variant="active" groups={groups} />
      </div>

      <div className="sm:hidden w-full px-1">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>

      <div className="sm:hidden w-full pt-1">
        <Suspense fallback={<div className="w-full h-10 bg-muted rounded animate-pulse" />}>
          <DynamicMeetingActions dateTime={meeting.dateTime} meetingId={meeting.id} />
        </Suspense>
      </div>

      <div className="hidden sm:block px-1 -mt-2">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>
    </Card>
  );
}