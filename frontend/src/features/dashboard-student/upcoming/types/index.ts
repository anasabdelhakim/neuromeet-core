export interface StudentUpcomingMeeting {
  id: string;
  title: string;
  course: string;
  instructor: string;
  dateTime: string;
  duration: number;
  status: string;
  meetingUrl?: string;
}
