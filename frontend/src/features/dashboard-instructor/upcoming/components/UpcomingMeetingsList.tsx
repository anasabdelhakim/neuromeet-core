import { dummyUpcomingMeetings } from "../constants/dummy-meetings";
import { UpcomingMeetingCard } from "./UpcomingMeetingCard";

export function UpcomingMeetingsList() {
  return (
    <div className="flex flex-col gap-4">
      {dummyUpcomingMeetings.map((meeting) => (
        <UpcomingMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
