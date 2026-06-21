import { Suspense } from "react";
import { TodaysMeetings } from "@/src/features/dashboard-instructor/home/components/TodaysMeetings";
import { InstructorGroups, InstructorGroupsSkeleton } from "@/src/features/dashboard-instructor/home/components/InstructorGroups";
import { HeroClock, HeroClockSkeleton } from "@/src/features/dashboard-shared/components/HeroClock";
import { QuickActions } from "@/src/features/dashboard-instructor/home/components/QuickActions";

export default function InstructorDashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      {/* Top Section: Hero & Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full">
          <Suspense fallback={<HeroClockSkeleton />}>
            <HeroClock />
          </Suspense>
        </div>
        <div className="lg:col-span-1 h-full">
          <Suspense fallback={<InstructorGroupsSkeleton />}>
            <InstructorGroups />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Today's Meetings Section */}
      <TodaysMeetings />
    </div>
  );
}


