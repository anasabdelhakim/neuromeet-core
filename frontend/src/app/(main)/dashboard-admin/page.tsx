import { Suspense } from "react";
import { HeroClock, HeroClockSkeleton } from "@/src/features/dashboard-shared/components/HeroClock";
import { Card } from "@/src/components/ui/card";
import { Users, UserCheck, Video } from "lucide-react";
import { AdminUsersClient } from "@/src/features/dashboard-admin/users/AdminUsersClient";
import { getUsersAction, getAdminStatsAction } from "@/src/features/dashboard-admin/actions/admin-actions";

async function AdminUsersLoader() {
  const initialData = await getUsersAction({ page: "1", limit: "20" });
  return <AdminUsersClient initialData={initialData} />;
}

async function AdminStatsLoader() {
  const statsRes = await getAdminStatsAction();
  const stats = statsRes.success && statsRes.data 
    ? statsRes.data 
    : { totalStudents: 0, totalInstructors: 0, totalMeetings: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 flex items-center justify-center gap-4 bg-black-soft-subtle border border-border">
        <div className="p-3 rounded-full bg-primary-soft">
          <Users size={24} className="text-primary-light" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground text-center">
            {stats.totalStudents === 0 ? "--" : stats.totalStudents}
          </p>
          <p className="text-sm text-muted-foreground text-center">Students</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center justify-center gap-4 bg-black-soft-subtle border border-border">
        <div className="p-3 rounded-full bg-status-success-soft">
          <UserCheck size={24} className="text-status-success" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground text-center">
            {stats.totalInstructors === 0 ? "--" : stats.totalInstructors}
          </p>
          <p className="text-sm text-muted-foreground text-center">Instructors</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center justify-center gap-4 bg-black-soft-subtle border border-border">
        <div className="p-3 rounded-full bg-status-live-soft">
          <Video size={24} className="text-status-live" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground text-center">
            {stats.totalMeetings === 0 ? "--" : stats.totalMeetings}
          </p>
          <p className="text-sm text-muted-foreground text-center">Total Meetings</p>
        </div>
      </Card>
    </div>
  );
}

export default function AdminHomePage() {

  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      {/* Hero — no upcoming badge for admin */}
      <Suspense fallback={<HeroClockSkeleton />}>
        <HeroClock showUpcoming={false} />
      </Suspense>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((id) => (
              <div key={id} className="h-[88px] bg-custom-gray border border-border animate-pulse rounded-soft" />
            ))}
          </div>
        }
      >
        <AdminStatsLoader />
      </Suspense>

      {/* User Management */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((id) => (
                <div
                  key={id}
                  className="w-full h-16 bg-custom-gray border border-border animate-pulse rounded-soft"
                />
              ))}
            </div>
          }
        >
          <AdminUsersLoader />
        </Suspense>
      </div>
    </div>
  );
}