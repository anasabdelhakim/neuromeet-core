import { Metadata } from "next";
import { Suspense } from "react";
import { RecordingsList } from "@/src/features/dashboard-instructor/recordings/components/RecordingList";

export const metadata: Metadata = {
  title: "My Recordings",
  description: "Access past recordings and notes.",
};
import { getRecordingsAction } from "@/src/features/dashboard-instructor/recordings/actions/recordings-actions";
import { connection } from "next/server";

async function StudentRecordingsContainer() {
  await connection();
  const recordings = await getRecordingsAction();
  return <RecordingsList recordings={recordings} isInstructor={false} />;
}

export default function StudentRecordingsPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <Suspense
        fallback={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="border border-border rounded-xl bg-card overflow-hidden shadow-soft flex flex-col">
                <div className="aspect-video bg-custom-gray animate-pulse relative" />
                <div className="p-6 flex flex-col gap-3">
                  <div className="h-5 w-3/4 bg-custom-gray animate-pulse rounded-soft" />
                  <div className="h-4 w-1/2 bg-custom-gray animate-pulse rounded-soft mb-2" />
                  <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                    <div className="flex gap-2">
                      <div className="w-9 h-9 bg-custom-gray animate-pulse rounded-hard" />
                      <div className="w-9 h-9 bg-custom-gray animate-pulse rounded-hard" />
                    </div>
                    <div className="w-20 h-9 bg-custom-gray animate-pulse rounded-medium" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <StudentRecordingsContainer />
      </Suspense>
    </div>
  );
}