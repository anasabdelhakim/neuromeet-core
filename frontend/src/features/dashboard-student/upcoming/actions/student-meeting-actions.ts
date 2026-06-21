"use server";

import { apiGet, apiPost } from "@/src/lib/api-client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export async function getStudentUpcomingMeetings() {
  try {
    const res = await apiGet<any>("/meetings/student/upcoming");
    const rawMeetings = res.data || [];

    // Sort meetings by scheduledAt descending (latest first, so newly scheduled meetings far in the future appear at the top)
    rawMeetings.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);
      return {
        id: m.id,
        title: m.title,
        groupName: m.group?.name || "General",
        date: format(d, "MMMM d, yyyy"),
        time: format(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: m.durationMinutes || 60,
        status: m.status,
      };
    });
  } catch (error) {
    console.error("Failed to fetch student upcoming meetings:", error);
    return [];
  }
}

export async function joinMeetingAction(meetingId: string, passcode: string) {
  let roomName = "";
  try {
    const res = await apiPost<any>(`/meetings/${meetingId}/join`, {
      passcode,
      consentGiven: true,
    });
    roomName = res.data?.livekitRoomName;
  } catch (error: any) {
    return { success: false, errorMessage: error.message || "Failed to join meeting" };
  }

  if (roomName) {
    redirect(`/livekit?room=${roomName}`);
  }

  return { success: false, errorMessage: "Meeting room not available" };
}
