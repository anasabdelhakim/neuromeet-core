import { dummyPreviousMeetings } from "../constants/dummy-meetings";
import { PreviousMeetingCard } from "./PreviousMeetingCard";

export function PreviousMeetingsList() {
  return (
    <div className="flex flex-col gap-4">
      {dummyPreviousMeetings.map((meeting) => (
        <PreviousMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
