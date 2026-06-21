export type ActiveTab = 'chat' | 'participants' | 'engagement' | null;

export interface MeetingPageProps {
  token: string;
  room: string;
  isInstructor?: boolean;
}
