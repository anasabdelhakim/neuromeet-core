import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UpcomingMeetingCard } from "../../upcoming/components/UpcomingMeetingCard";
import { getUpcomingMeetings } from "../actions/meeting-actions";
import { getGroupsAction } from "../../groups/actions/groups-actions";
import { connection } from "next/server";
import { Suspense } from "react";

async function TodaysMeetingsList() {
  await connection();
  const [meetingsRes, groupsRes] = await Promise.all([
    getUpcomingMeetings(),
    getGroupsAction()
  ]);
  const meetings = meetingsRes.slice(0, 3);
  const groups = groupsRes.success && groupsRes.data ? groupsRes.data : [];

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-black-soft-subtle/20 border border-border/40 rounded-xl">
        <p className="text-sm font-medium text-muted-foreground">No meetings scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting: any) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} groups={groups} />
      ))}
    </div>
  );
}

function TodaysMeetingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
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
  );
}

export function TodaysMeetings() {
  return (
    <section className="mt-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Today's Meetings</h2>
        </div>
        <Link
          href="/dashboard-instructor/upcoming"
          className="text-xs font-semibold text-primary-light hover:text-primary flex items-center transition-colors uppercase tracking-wider"
        >
          View all <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      {/* List */}
      <Suspense fallback={<TodaysMeetingsSkeleton />}>
        <TodaysMeetingsList />
      </Suspense>
    </section>
  );
}