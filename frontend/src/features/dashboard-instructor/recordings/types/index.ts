export interface Recording {
  id: string;
  title: string;
  course: string;
  dateTime: string;
  duration: number; // in minutes
  fileSize: string;
  viewsCount: number;
  image: string;
  videoUrl: string;
  topics: string[];
}
