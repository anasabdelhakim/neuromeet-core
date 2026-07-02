export interface UpcomingMeeting {
  id: string;
  title: string;
  group: string;
  date: string;
  time: string;
  dateTime: string;
  duration: number;
  status: string;
  passcode?: string;
}
