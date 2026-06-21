export type ActiveSidebarTab = "chat" | "participants" | "engagement" | null;
export type ActiveTab = ActiveSidebarTab; // Alias for backward compatibility if needed

export interface MeetingPageProps {
  token: string;
  room: string;
  isInstructor?: boolean;
}
