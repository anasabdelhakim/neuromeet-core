import { PreviousMeetingsList } from "@/src/features/dashboard-instructor/previous/components/PreviousMeetingsList";

const PreviousMeetingsPage = () => {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <PreviousMeetingsList />
    </div>
  );
};

export default PreviousMeetingsPage;
