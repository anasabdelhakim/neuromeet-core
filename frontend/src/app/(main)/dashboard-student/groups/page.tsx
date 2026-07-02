import { Suspense } from "react";
import { StudentGroupsList } from "@/src/features/dashboard-student/groups/components/StudentGroupsList";
import { StudentInvitationsList } from "@/src/features/dashboard-student/groups/components/StudentInvitationsList";

export default function StudentGroupsPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance w-full">
      {/* Static Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Groups and classes you are currently enrolled in
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <StudentInvitationsList />
      </Suspense>

      {/* Dynamic Content */}
      <Suspense fallback={<StudentGroupsSkeleton />}>
        <StudentGroupsList />
      </Suspense>
    </div>
  );
}

function StudentGroupsSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col h-40 bg-black-soft-subtle border border-border animate-pulse rounded-soft p-6 justify-between opacity-80">
            <div className="flex flex-col gap-3">
              <div className="h-6 w-3/4 bg-white-soft-muted rounded-medium" />
            </div>
            <div className="pt-4 border-t border-border/50 mt-auto flex justify-between">
              <div className="h-4 w-1/3 bg-white-soft-muted rounded-medium" />
              <div className="h-4 w-1/4 bg-white-soft-muted rounded-medium" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
