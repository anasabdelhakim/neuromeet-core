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

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} groups={groups} />
      ))}
    </div>
  );
}
