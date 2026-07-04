import { Metadata } from "next";
import { getInstructorMeetingsAction, getMeetingAnalyticsAction } from "@/src/features/dashboard-instructor/analytics/actions/analytics-actions";
import InstructorAnalyticsClient from "@/src/features/dashboard-instructor/analytics/components/InstructorAnalyticsClient";

import { Suspense } from "react";
import { Loader } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics | NeuroMeet",
  description: "View engagement analytics and student focus metrics.",
};

async function AnalyticsContent({ meetingId }: { meetingId?: string }) {
  const meetings = await getInstructorMeetingsAction();
  
  const selectedId = meetingId || (meetings.length > 0 ? meetings[0].id : "");
  const data = selectedId ? await getMeetingAnalyticsAction(selectedId) : null;

  return <InstructorAnalyticsClient meetings={meetings} initialData={data} />;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ meetingId?: string }> }) {
  const sp = await searchParams;
  
  return (
    <Suspense fallback={<AnalyticsSkeleton />} key={sp.meetingId}>
      <AnalyticsContent meetingId={sp.meetingId} />
    </Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full mt-4">
      {/* KPI Cards Mock */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-black-soft-subtle border border-border animate-pulse rounded-soft p-3 sm:p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <div className="h-4 w-16 sm:w-24 bg-white-soft-muted rounded-medium shrink-0" />
              <div className="h-8 w-8 bg-white-soft-muted rounded-full shrink-0" />
            </div>
            <div className="h-8 w-16 bg-white-soft-muted rounded-medium mt-2 shrink-0" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Scatter Chart Mock */}
        <div className="col-span-1 lg:col-span-3 h-[400px] bg-black-soft-subtle border border-border animate-pulse rounded-soft p-5 flex flex-col">
          <div className="h-5 w-40 bg-white-soft-muted rounded-medium mb-1" />
          <div className="h-3 w-56 bg-white-soft-muted rounded-medium mb-6 opacity-60" />
          <div className="flex-1 w-full bg-black-soft-muted rounded-medium border border-border/50" />
        </div>
      </div>

      {/* Table Mock */}
      <div className="w-full bg-black-soft-subtle border border-border rounded-soft p-5 flex flex-col gap-4 animate-pulse">
         <div className="h-5 w-48 bg-white-soft-muted rounded-medium mb-1" />
         <div className="h-3 w-64 bg-white-soft-muted rounded-medium mb-2 opacity-60" />
         {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-black-soft-muted rounded-medium border border-border/50" />
         ))}
      </div>
    </div>
  );
}
