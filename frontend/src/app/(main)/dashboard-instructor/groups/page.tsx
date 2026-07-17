import { Suspense } from "react";
import { GroupsList } from "@/src/features/dashboard-instructor/groups/components/GroupsList";
import { CreateGroupModal } from "@/src/features/dashboard-instructor/groups/components/CreateGroupModal";

export const metadata = {
  title: "Groups | NeuroMeet",
  description: "Manage your student groups",
};

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden sm:block">
          <h2 className="text-3xl font-bold tracking-tight">Your Groups</h2>
          <p className="text-muted-foreground mt-1">
            Manage your student groups and invite codes
          </p>
        </div>
        <CreateGroupModal />
      </div>

      {}
      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsList />
      </Suspense>
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col h-48 bg-black-soft-subtle border border-border animate-pulse rounded-soft p-6 justify-between opacity-80">
            {}
            <div className="flex flex-col gap-3">
              <div className="h-6 w-3/4 bg-white-soft-muted rounded-medium" />
              <div className="h-4 w-1/2 bg-white-soft-muted rounded-medium" />
            </div>

            {}
            <div className="flex flex-col gap-2 mt-4">
              <div className="h-3 w-full bg-white-soft-muted rounded-medium" />
              <div className="h-3 w-5/6 bg-white-soft-muted rounded-medium" />
            </div>

            {}
            <div className="pt-4 border-t border-border/50 mt-auto">
              <div className="h-4 w-1/3 bg-white-soft-muted rounded-medium" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
