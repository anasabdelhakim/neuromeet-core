import { PreviousMeetingCard } from "./PreviousMeetingCard";
import { getPreviousMeetingsAction } from "../actions/previous-actions";
import { connection } from "next/server";
import { CalendarX } from "lucide-react";
export async function PreviousMeetingsList() {
  await connection();
  const meetings = await getPreviousMeetingsAction();
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-border bg-black-soft-subtle rounded-soft opacity-80">
        <CalendarX size={40} className="text-muted-foreground mb-3 opacity-40" />
        <p className="text-muted-foreground text-sm font-medium">No previous meetings found.</p>
        <p className="text-muted-foreground text-xs mt-1 opacity-60">
          Completed or ended meetings will appear here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <PreviousMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
