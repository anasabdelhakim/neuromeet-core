import { UpcomingMeeting } from "../types";

// Helper to create dates relative to now for demo purposes
const now = new Date();
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  // Using 'T' for better browser compatibility
  return `${y}-${m}-${d}T${h}:${min}:00`;
};

export const dummyUpcomingMeetings: UpcomingMeeting[] = [
  {
    id: "live-1",
    title: "System Design Lecture (LIVE)",
    dateTime: formatDate(new Date(now.getTime() - 5 * 60000)), // 5 mins ago
    duration: 90,
    status: "Live",
  },
  {
    id: "soon-1",
    title: "Project Review (SOON)",
    dateTime: formatDate(new Date(now.getTime() + 15 * 60000)), // 15 mins from now
    duration: 45,
    status: "Upcoming",
  },
  {
    id: "1",
    title: "Q2 Product Roadmap Sync",
    dateTime: formatDate(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)), // 2 days later
    duration: 30,
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Client Onboarding: Acme Corp",
    dateTime: formatDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)), // 3 days later
    duration: 60,
    status: "Upcoming",
  },
];
