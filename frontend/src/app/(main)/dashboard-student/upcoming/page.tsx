import { StudentUpcomingList } from "@/src/features/dashboard-student/upcoming/components/StudentUpcomingList";
import { Suspense } from "react";

export default function StudentUpcomingPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
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
        <StudentUpcomingList />
      </Suspense>
    </div>
  );
}