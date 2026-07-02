export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  groups: { name: string; color: string }[];
  enrolledDate: string;
  lastActive: string;
  isActive: boolean;
  totalMeetings: number;
  avgEngagement: number;
}

export interface StudentGroup {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}