import { TodaysMeetings } from "@/src/features/dashboard-instructor/home/components/TodaysMeetings";
import { InstructorGroups } from "@/src/features/dashboard-instructor/home/components/InstructorGroups";
import { HeroClock } from "@/src/features/dashboard-instructor/home/components/HeroClock";
import { QuickActions } from "@/src/features/dashboard-instructor/home/components/QuickActions";

export default function InstructorDashboardPage() {
  return (
    <>
      {/* Top Section: Hero & Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full">
          <HeroClock />
        </div>
        <div className="lg:col-span-1 h-full">
          <InstructorGroups />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Today's Meetings Section */}
      <TodaysMeetings />
    </>
  );
}


