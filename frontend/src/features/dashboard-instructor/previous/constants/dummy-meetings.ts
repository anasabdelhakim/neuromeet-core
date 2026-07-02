import { PreviousMeeting } from "../types";

export const dummyPreviousMeetings: PreviousMeeting[] = [
  {
    id: "prev-1",
    title: "System Design Lecture 6 — Microservices",
    dateTime: "May 16, 2026 at 11:00 AM",
    duration: 90,
    attendeesCount: 42,
    totalStudents: 45,
    hasRecording: true,
    recordingUrl: "/recordings/system-design-6",
  },
  {
    id: "prev-2",
    title: "Algorithms Q&A Session",
    dateTime: "May 14, 2026 at 02:00 PM",
    duration: 60,
    attendeesCount: 25,
    totalStudents: 32,
    hasRecording: true,
    recordingUrl: "/recordings/algorithms-qa",
  },
  {
    id: "prev-3",
    title: "Database Optimization Masterclass",
    dateTime: "May 11, 2026 at 04:00 PM",
    duration: 120,
    attendeesCount: 44,
    totalStudents: 45,
    hasRecording: false,
  },
  {
    id: "prev-4",
    title: "React Server Components Workshop",
    dateTime: "May 08, 2026 at 03:00 PM",
    duration: 90,
    attendeesCount: 30,
    totalStudents: 32,
    hasRecording: true,
    recordingUrl: "/recordings/rsc-workshop",
  },
];
