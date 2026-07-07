import { Suspense } from "react";
import { StudentGroupsList, StudentGroupsListSkeleton } from "@/src/features/dashboard-student/groups/components/StudentGroupsList";

import { HeroClock, HeroClockSkeleton } from "@/src/features/dashboard-shared/components/HeroClock";
import { DataCard } from "@/src/features/dashboard-shared/components/DataCard";
import { CalendarDays, Clock, BookOpen, ChevronRight, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { connection } from "next/server";
import { getStudentUpcomingMeetings, getStudentTodayMeetings } from "@/src/features/dashboard-student/upcoming/actions/student-meeting-actions";
import { getRecordingsAction } from "@/src/features/dashboard-instructor/recordings/actions/recordings-actions";
import { getStudentGroupsAction } from "@/src/features/dashboard-student/groups/actions/student-groups-actions";
import { StudentUpcomingCard } from "@/src/features/dashboard-student/upcoming/components/StudentUpcomingCard";
import { CalendarX } from "lucide-react";

async function StudentHeroClockWrapper() {
  await connection();
  const allMeetings = await getStudentUpcomingMeetings();
  const nextMeeting = allMeetings[0];
  return <HeroClock upcomingMeeting={nextMeeting ? { time: nextMeeting.time, title: nextMeeting.title } : null} />;
}

async function StudentStatsContainer() {
  await connection();
  const [upcoming, groupsRes, recordings] = await Promise.all([
    getStudentUpcomingMeetings(),
    getStudentGroupsAction(),
    getRecordingsAction(),
  ]);

  const groupsCount = groupsRes.success && groupsRes.data ? groupsRes.data.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <DataCard
        icon={CalendarDays}
        label="Upcoming Meetings"
        value={upcoming.length}
        colorClass="text-brand-cyan"
        bgClass="bg-brand-cyan/10 border-brand-cyan/20"
      />
      <DataCard
        icon={Users}
        label="Enrolled Groups"
        value={groupsCount}
        colorClass="text-status-success"
        bgClass="bg-status-success/10 border-status-success/20"
      />
      <DataCard
        icon={BookOpen}
        label="Recordings Available"
        value={recordings.length}
        colorClass="text-status-live"
        bgClass="bg-status-live/10 border-status-live/20"
      />
    </div>
  );
}

export function StudentHome() {
  return (
    <div className="space-y-6 animate-page-entrance">
      <Suspense fallback={<HeroClockSkeleton />}>
        <StudentHeroClockWrapper />
      </Suspense>

      {/* Quick Stats using Shared DataCard */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-black-soft-subtle border border-border rounded-soft animate-pulse" />
            ))}
          </div>
        }
      >
        <StudentStatsContainer />
      </Suspense>

      {/* Upcoming Sessions Section (Styled Identically to Instructor TodaysMeetings) */}
      <section className="mt-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Today's Meetings</h2>
          </div>
          <Link
            href="/dashboard-student/upcoming"
            className="text-xs font-semibold text-primary-light hover:text-primary flex items-center transition-colors uppercase tracking-wider"
          >
            View all <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-full p-5 flex flex-col gap-5 border border-border bg-black-soft-subtle rounded-soft opacity-80"
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="h-6 w-1/2 sm:w-1/3 bg-white-soft-muted animate-pulse rounded-medium" />
                      <div className="h-4 w-32 bg-white-soft-muted animate-pulse rounded-medium" />
                    </div>
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      <div className="h-10 w-24 bg-white-soft-muted animate-pulse rounded-soft" />
                    </div>
                  </div>
                  <div className="w-full mt-1">
                    <div className="h-1.5 w-full bg-white-soft-muted/30 animate-pulse rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <StudentHomeUpcomingList />
        </Suspense>
      </section>
    </div>
  );
}

async function StudentHomeUpcomingList() {
  await connection();
  const allMeetings = await getStudentTodayMeetings();

  const meetings = allMeetings.slice(0, 3);

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-border bg-black-soft-subtle rounded-soft opacity-80">
        <CalendarX size={40} className="text-muted-foreground mb-3 opacity-40" />
        <p className="text-muted-foreground text-sm font-medium">No upcoming sessions today.</p>
        <p className="text-muted-foreground text-xs mt-1 opacity-60">
          Your instructor has not scheduled any meetings yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <StudentUpcomingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}