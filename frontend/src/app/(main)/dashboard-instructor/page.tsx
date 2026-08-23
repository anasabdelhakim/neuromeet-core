import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Instructor Home",
  description: "Overview of your upcoming meetings and groups.",
};
import { TodaysMeetings } from "@/src/features/dashboard-instructor/home/components/TodaysMeetings";
import { InstructorGroups, InstructorGroupsSkeleton } from "@/src/features/dashboard-instructor/home/components/InstructorGroups";
import { HeroClock, HeroClockSkeleton } from "@/src/features/dashboard-shared/components/HeroClock";
import { QuickActions } from "@/src/features/dashboard-instructor/home/components/QuickActions";
import { getUpcomingMeetings } from "@/src/features/dashboard-instructor/home/actions/meeting-actions";
import { connection } from "next/server";

async function InstructorHeroClockWrapper() {
  await connection();
  const allMeetings = await getUpcomingMeetings();
  const nextMeeting = allMeetings[0];
  return <HeroClock upcomingMeeting={nextMeeting ? { time: nextMeeting.time, title: nextMeeting.title } : null} />;
}


export default function InstructorDashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full">
          <Suspense fallback={<HeroClockSkeleton />}>
            <InstructorHeroClockWrapper />
          </Suspense>
        </div>
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<InstructorGroupsSkeleton />}>
            <InstructorGroups />
          </Suspense>
        </div>
      </div>

      <QuickActions />

      <TodaysMeetings />
    </div>
  );
}

