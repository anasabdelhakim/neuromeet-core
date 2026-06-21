import { Suspense } from "react";
import { RecordingsList } from "@/src/features/dashboard-instructor/recordings/components/RecordingList";

export default function StudentRecordingsPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <Suspense
        fallback={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className="aspect-video bg-custom-gray border border-border animate-pulse rounded-soft"
              />
            ))}
          </div>
        }
      >
        <RecordingsList />
      </Suspense>
    </div>
  );
}