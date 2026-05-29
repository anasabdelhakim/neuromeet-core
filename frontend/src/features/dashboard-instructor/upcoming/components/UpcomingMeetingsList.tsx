import { dummyUpcomingMeetings } from "../constants/dummy-meetings";
import { UpcomingMeetingCard } from "./UpcomingMeetingCard";
import { connection } from "next/server"; 

export async function UpcomingMeetingsList() {
  await connection();
  return (
    <div className="flex flex-col gap-4">
      {dummyUpcomingMeetings.map((meeting) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
