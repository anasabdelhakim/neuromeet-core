import { Meeting, Group } from "../types";

export const todayMeetings: Meeting[] = [
  {
    id: "m1",
    title: "System Design — Lecture 7",
    time: "11:00 AM – 12:30 PM",
    participants: ["PA", "HS", "JA", "IT"],
    status: "Starting Soon",
    courseTag: "CS401",
  },
  {
    id: "m2",
    title: "Algorithms Office Hours",
    time: "2:00 PM – 3:00 PM",
    participants: ["RA", "MK", "OT"],
    status: "Live",
    courseTag: "CS301",
  },
  {
    id: "m3",
    title: "Capstone Project Review",
    time: "4:00 PM – 5:00 PM",
    participants: ["NA", "YS", "BF", "HD"],
    status: "Scheduled",
    courseTag: "GP500",
  },
];

export const instructorGroups: Group[] = [
  { id: 1, name: "System Design Cohort", members: 45, color: "bg-brand-cyan" },
  { id: 2, name: "Web Dev Bootcamp", members: 32, color: "bg-brand-purple" },
  { id: 3, name: "Advanced Algorithms", members: 28, color: "bg-status-live" },
];
