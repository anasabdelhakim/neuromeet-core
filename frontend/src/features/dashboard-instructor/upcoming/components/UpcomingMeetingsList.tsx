import { getDummyUpcomingMeetings } from "../constants/dummy-meetings";
import { UpcomingMeetingCard } from "./UpcomingMeetingCard";
import { connection } from "next/server"; 

export async function UpcomingMeetingsList() {
  await connection();
  const meetings = getDummyUpcomingMeetings();
  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
