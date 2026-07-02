import { StudentUpcomingMeeting } from "../types/index";

export const dummyStudentUpcomingMeetings: StudentUpcomingMeeting[] = [
  {
    id: "1",
    title: "System Design Lecture",
    course: "CS401",
    instructor: "Dr. Ahmed Hassan",
    dateTime: "2025-06-18T11:00:00",
    duration: 90,
    status: "upcoming",
    meetingUrl: "/meeting/1",
  },
  {
    id: "2",
    title: "Machine Learning Workshop",
    course: "CS301",
    instructor: "Dr. Sara Adel",
    dateTime: "2025-06-18T14:00:00",
    duration: 120,
    status: "upcoming",
    meetingUrl: "/meeting/2",
  },
  {
    id: "3",
    title: "Database Systems Review",
    course: "CS201",
    instructor: "Prof. Mohamed Ali",
    dateTime: "2025-06-19T10:00:00",
    duration: 60,
    status: "upcoming",
    meetingUrl: "/meeting/3",
  },
  {
    id: "4",
    title: "Algorithms Problem Solving",
    course: "CS301",
    instructor: "Dr. Nour El-Din",
    dateTime: "2025-06-20T15:00:00",
    duration: 90,
    status: "upcoming",
    meetingUrl: "/meeting/4",
  },
];
