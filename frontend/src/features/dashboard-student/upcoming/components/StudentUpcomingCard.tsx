import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AlarmClock } from "lucide-react";
import { StudentUpcomingMeeting } from "../types/index";
import { Suspense } from "react";
import { 
  DynamicStudentMeetingBadge, 
  DynamicStudentMeetingActions, 
  DynamicStudentMeetingStatusBar 
} from "./StudentMeetingDynamic";
import { calculateMeetingStatus } from "@/src/features/dashboard-instructor/upcoming/helper/time-calc";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/avatars";

interface Props {
  meeting: StudentUpcomingMeeting;
}

export function StudentUpcomingCard({ meeting }: Props) {
  const { isArrived, isStartingSoon } = calculateMeetingStatus(meeting.dateTime);
  const variant = isArrived ? "glass" : isStartingSoon ? "gradient" : "default";

  const host = (meeting as any).host;
  
  const mappedAvatars = [];
  
  if (host) {
    mappedAvatars.push({
      alt: host.name || "Instructor",
      initials: host.name ? host.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "IN",
      src: host.avatarUrl,
      color: "bg-primary text-white border-primary",
      isInstructor: true
    });
  }

  const studentAvatars = (meeting as any).group?.enrollments?.map((e: any) => ({
    alt: e.student?.name || "Unknown",
    initials: e.student?.name ? e.student.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??",
    src: e.student?.avatarUrl,
    color: "bg-primary-soft-muted",
  })) || [];

  mappedAvatars.push(...studentAvatars);
  
  // We want to show a max of 5 avatars. We pass total count to AvatarChain so it shows the correct badge.
  const totalCount = host ? ((meeting as any).totalEnrollments || 0) + 1 : ((meeting as any).totalEnrollments || 0);

  return (
    <Card
      variant={variant}
      className="w-full rounded-soft p-4 sm:p-5 flex flex-col gap-4 border transition-all duration-normal ease-standard transform-gpu"
    >
      {}
      <div className="flex items-start sm:items-center justify-between w-full gap-4">
        <div className="flex w-full justify-between">
          {}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground max-sm:max-w-60 truncate">
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
            <span className="text-xs opacity-60">({meeting.groupName})</span>
            <Suspense fallback={<div className="w-12 h-5 bg-muted rounded animate-pulse" />}>
              <DynamicStudentMeetingBadge dateTime={meeting.dateTime} />
            </Suspense>
          </CardDescription>
        </div>

        {}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <AvatarChain avatars={mappedAvatars} max={5} totalCount={totalCount} />
          <Suspense fallback={<div className="w-24 h-10 bg-muted rounded animate-pulse" />}>
            <DynamicStudentMeetingActions dateTime={meeting.dateTime} meetingId={meeting.id} />
          </Suspense>
        </div>
      </div>
    </div>

      {}
      <div className="sm:hidden px-1 w-full">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicStudentMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>

      {}
      <div className="sm:hidden w-full pt-1">
        <Suspense fallback={<div className="w-full h-10 bg-muted rounded animate-pulse" />}>
          <DynamicStudentMeetingActions dateTime={meeting.dateTime} meetingId={meeting.id} />
        </Suspense>
      </div>

      {}
      <div className="hidden sm:block px-1 -mt-2">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicStudentMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>
    </Card>
  );
}
