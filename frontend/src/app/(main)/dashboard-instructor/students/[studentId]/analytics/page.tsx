import { Metadata } from "next";
import { getStudentAnalyticsAction } from "@/src/features/dashboard-instructor/analytics/actions/analytics-actions";
import StudentAnalyticsClient from "@/src/features/dashboard-instructor/analytics/components/StudentAnalyticsClient";
import { Suspense } from "react";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Student Analytics | NeuroMeet",
  description: "View specific student engagement metrics.",
};

export async function generateStaticParams() {
  return [{ studentId: "dummy" }];
}

async function StudentAnalyticsContent({ params }: { params: Promise<{ studentId: string }> }) {
  await connection();
  const { studentId } = await params;
  const data = await getStudentAnalyticsAction(studentId);
  return <StudentAnalyticsClient data={data!} />;
}

export default function SpecificStudentAnalyticsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <StudentAnalyticsContent params={params} />
    </Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      {/* Header Mock */}
      <div className="hidden sm:block">
        <div className="h-8 w-64 bg-white-soft-muted animate-pulse rounded-medium" />
        <div className="h-4 w-96 bg-white-soft-muted animate-pulse rounded-medium mt-2" />
      </div>

      {/* KPI Cards Mock */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Mock */}
        <div className="col-span-1 lg:col-span-3 h-[400px] bg-black-soft-subtle border border-border animate-pulse rounded-soft p-5 flex flex-col">
          <div className="h-5 w-40 bg-white-soft-muted rounded-medium mb-1" />
          <div className="h-3 w-56 bg-white-soft-muted rounded-medium mb-6 opacity-60" />
          <div className="flex-1 w-full bg-black-soft-muted rounded-medium border border-border/50" />
        </div>
      </div>
    </div>
  );
}
