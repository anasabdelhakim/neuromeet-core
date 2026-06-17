import { Suspense } from "react";
import { UpcomingMeetingsList } from "@/src/features/dashboard-instructor/upcoming/components/UpcomingMeetingsList";

const UpcomingMeetingsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<UpcomingMeetingsSkeleton />}>
        <UpcomingMeetingsList />
      </Suspense>
    </div>
  );
};

function UpcomingMeetingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((id) => (
        <div
          key={id}
          className="w-full h-36 bg-custom-gray border border-border animate-pulse rounded-soft p-5"
        />
      ))}
    </div>
  );
}

export default UpcomingMeetingsPage;
