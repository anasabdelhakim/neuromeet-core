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

function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((id) => (
        <Card key={id} className="p-4 flex items-center justify-center gap-4 bg-black-soft-subtle border border-border">
          <div className="h-[48px] w-[48px] rounded-full bg-custom-gray animate-pulse" />
          <div className="space-y-2 flex flex-col items-center">
            <div className="h-8 w-12 bg-custom-gray animate-pulse rounded" />
            <div className="h-3 w-20 bg-custom-gray animate-pulse rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 h-13">
        <div className="relative flex-1">
          <div className="h-12 w-full bg-custom-gray animate-pulse rounded-soft" />
        </div>
        <div className="h-12 w-full sm:w-60 bg-custom-gray animate-pulse rounded-soft" />
      </div>
      <div className="border border-border max-sm:mt-12 rounded-soft overflow-hidden bg-black-soft-subtle flex flex-col">
        <div className="p-2 overflow-x-auto">
          <div className="w-full min-w-[800px]">
            <div className="bg-black-soft h-14 w-full animate-pulse rounded-t-soft" />
            {[1, 2, 3, 4, 5].map((id) => (
              <div key={id} className="flex items-center justify-between py-4 px-4 border-b border-border/50 last:border-0 hover:bg-black-soft transition-colors">
                <div className="h-5 w-32 bg-custom-gray animate-pulse rounded" />
                <div className="h-5 w-48 bg-custom-gray animate-pulse rounded hidden md:block" />
                <div className="h-10 w-40 bg-custom-gray animate-pulse rounded-soft" />
                <div className="h-6 w-20 bg-custom-gray animate-pulse rounded-full" />
                <div className="h-5 w-24 bg-custom-gray animate-pulse rounded" />
                <div className="h-10 w-10 bg-custom-gray animate-pulse rounded-soft" />
              </div>
            ))}
          </div>
        </div>
      </div>
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
      <Suspense fallback={<AdminStatsSkeleton />}>
        <AdminStatsLoader />
      </Suspense>

      {/* User Management */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <Suspense fallback={<AdminUsersSkeleton />}>
          <AdminUsersLoader />
        </Suspense>
      </div>
    </div>
  );
}