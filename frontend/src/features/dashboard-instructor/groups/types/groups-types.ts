export interface Group {
  id: string;
  name: string;
  subject: string | null;
  description: string | null;

  created_at?: string;
  enrollments?: any[];
  _count?: {
    enrollments: number;
  };
}

export type CreateGroupState = {
  success: boolean;
  error?: string;
  data?: Group;
};
