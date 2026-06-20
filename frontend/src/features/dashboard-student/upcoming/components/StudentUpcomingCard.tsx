import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/avatars";
import { StudentUpcomingMeeting } from "../types/index";
import { Suspense } from "react";
import { 
  DynamicStudentMeetingBadge, 
  DynamicStudentMeetingActions, 
  DynamicStudentMeetingStatusBar 
} from "./StudentMeetingDynamic";

interface Props {
  meeting: StudentUpcomingMeeting;
}

export function StudentUpcomingCard({ meeting }: Props) {
  // Static shell with fixed variant. Dynamic elements loaded via Suspense.
  return (
    <Card
      variant="default"
      className="w-full p-4 sm:p-5 flex flex-col gap-4 transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover bg-black-soft-subtle border shadow-none opacity-80 hover:opacity-100"
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
            <span className="whitespace-nowrap">{meeting.dateTime.replace("T", " ")}</span>
            <Suspense fallback={<div className="w-12 h-5 bg-muted rounded animate-pulse" />}>
              <DynamicStudentMeetingBadge dateTime={meeting.dateTime} />
            </Suspense>
          </CardDescription>
        </div>

        {/* Desktop Actions: Hidden on Mobile */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <AvatarChain/>
          <Suspense fallback={<div className="w-24 h-10 bg-muted rounded animate-pulse" />}>
            <DynamicStudentMeetingActions dateTime={meeting.dateTime} />
          </Suspense>
        </div>
      </div>

      {/* Mobile Only: Progress Bar */}
      <div className="sm:hidden px-1 w-full">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicStudentMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>

      {/* Mobile Only: Action Button */}
      <div className="sm:hidden w-full">
        <Suspense fallback={<div className="w-full h-10 bg-muted rounded animate-pulse" />}>
          <DynamicStudentMeetingActions dateTime={meeting.dateTime} />
        </Suspense>
      </div>

      {/* Desktop Only: Progress Bar */}
      <div className="hidden sm:block px-1 -mt-1">
        <Suspense fallback={<div className="w-full h-2 bg-muted rounded animate-pulse mt-8" />}>
          <DynamicStudentMeetingStatusBar dateTime={meeting.dateTime} duration={meeting.duration} />
        </Suspense>
      </div>
    </Card>
  );
}
