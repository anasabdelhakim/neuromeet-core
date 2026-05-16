export interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  status: "Starting Soon" | "Live" | "Scheduled";
  courseTag: string;
}

export interface Group {
  id: number;
  name: string;
  members: number;
  color: string;
}
