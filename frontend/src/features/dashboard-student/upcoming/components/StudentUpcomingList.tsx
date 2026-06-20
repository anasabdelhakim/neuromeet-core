import { StudentUpcomingCard } from "./StudentUpcomingCard";
import { dummyStudentUpcomingMeetings } from "../constants/dummy";

export function StudentUpcomingList() {
  const meetings = dummyStudentUpcomingMeetings;

  return (
    <div className="flex flex-col gap-4">
      {meetings.map((meeting) => (
        <StudentUpcomingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
