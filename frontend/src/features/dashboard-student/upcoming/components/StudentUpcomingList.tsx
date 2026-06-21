import { StudentUpcomingCard } from "./StudentUpcomingCard";
import { getStudentUpcomingMeetings } from "../actions/student-meeting-actions";
import { CalendarX } from "lucide-react";
import { connection } from "next/server";

export async function StudentUpcomingList() {
  await connection();
  const meetings = await getStudentUpcomingMeetings();

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarX size={48} className="text-muted-foreground mb-4 opacity-40" />
        <p className="text-muted-foreground text-sm">No upcoming meetings found.</p>
        <p className="text-muted-foreground text-xs mt-1 opacity-60">
          Your instructor will schedule sessions for your enrolled groups.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <StudentUpcomingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
