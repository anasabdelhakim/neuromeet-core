import { StudentUpcomingList } from "@/src/features/dashboard-student/upcoming/components/StudentUpcomingList";
import { Suspense } from "react";

export default function StudentUpcomingPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="w-full h-36 bg-custom-gray border border-border animate-pulse rounded-soft p-5"
              />
            ))}
          </div>
        }
      >
        <StudentUpcomingList />
      </Suspense>
    </div>
  );
}