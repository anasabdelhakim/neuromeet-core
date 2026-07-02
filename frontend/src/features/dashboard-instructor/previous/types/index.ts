export interface PreviousMeeting {
  id: string;
  title: string;
  dateTime: string;
  duration: number;
  attendeesCount: number;
  totalStudents: number;
  hasRecording: boolean;
  recordingUrl?: string;
  group?: any;
  avgEngagement?: number;
}
