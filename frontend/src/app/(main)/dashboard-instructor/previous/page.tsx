import { PreviousMeetingsList } from "@/src/features/dashboard-instructor/previous/components/PreviousMeetingsList";
import { Suspense } from "react";
function PreviousMeetingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full p-4 sm:p-5 border border-border bg-card rounded-soft flex flex-col gap-4 animate-pulse">
          {/* Top Row: Title, Badges & Actions */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-48 bg-muted rounded-medium" />
                <div className="h-5 w-20 bg-muted rounded-medium" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-4 w-32 bg-muted rounded-medium" />
                <div className="h-4 w-28 bg-muted rounded-medium" />
              </div>
            </div>
            {/* Desktop Action Buttons Skeleton */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3].map((a) => (
                  <div key={a} className="inline-block h-8 w-8 rounded-full bg-muted ring-2 ring-background" />
                ))}
              </div>
              <div className="h-9 w-24 bg-muted rounded-medium" />
              <div className="h-9 w-20 bg-muted rounded-medium" />
            </div>
          </div>
          {/* Bottom Row: Engagement Bar Skeleton */}
          <div className="flex flex-col gap-2 w-full pt-2">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-muted rounded-medium" />
              <div className="h-3 w-12 bg-muted rounded-medium" />
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
const PreviousMeetingsPage = () => {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <Suspense fallback={<PreviousMeetingsSkeleton />}>
        <PreviousMeetingsList />
      </Suspense>
    </div>
  );
};
export default PreviousMeetingsPage;
