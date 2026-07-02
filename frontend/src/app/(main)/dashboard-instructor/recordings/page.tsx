import { Suspense } from "react";
import { RecordingsList } from "@/src/features/dashboard-instructor/recordings";
import { getRecordingsAction } from "@/src/features/dashboard-instructor/recordings/actions/recordings-actions";

async function RecordingsContainer() {
  const recordings = await getRecordingsAction();
  return <RecordingsList recordings={recordings} isInstructor={true} />;
}

const RecordingsPage = () => {
  return (
    <div className="animate-page-entrance">
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
        <RecordingsContainer />
      </Suspense>
    </div>
  );
};

export default RecordingsPage;
