import { UpcomingMeetingCard } from "./UpcomingMeetingCard";
import { connection } from "next/server"; 
import { getUpcomingMeetings } from "../../home/actions/meeting-actions";
import { getGroupsAction } from "../../groups/actions/groups-actions";

export async function UpcomingMeetingsList() {
  await connection();
  const [meetings, groupsRes] = await Promise.all([
    getUpcomingMeetings(),
    getGroupsAction()
  ]);
  
  const groups = groupsRes.success && groupsRes.data ? groupsRes.data : [];

  if (!meetings || meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-border/50 rounded-xl bg-black-soft-subtle/30">
        <p className="text-muted-foreground font-medium">No upcoming meetings scheduled.</p>
        <p className="text-muted-foreground text-sm mt-1 opacity-70">
          Create a new meeting to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} groups={groups} />
      ))}
    </div>
  );
}
