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
      
      let realDuration = m.durationMinutes || 60;
      if (m.startedAt && m.endedAt) {
        const start = new Date(m.startedAt).getTime();
        const end = new Date(m.endedAt).getTime();
        realDuration = Math.max(1, Math.round((end - start) / 60000));
      }

      return {
        id: m.id,
        title: m.title,
        groupName: m.group?.name || "General",
        date: format(d, "MMMM d, yyyy"),
        time: format(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: realDuration,
        status: m.status,
      };
    });
  } catch (error) {
    console.error("Failed to fetch student upcoming meetings:", error);
    return [];
  }
}

export async function getStudentPreviousMeetings() {
  try {
    const res = await apiGet<any>("/meetings/student/previous");
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch student previous meetings:", error);
    return [];
  }
}

import { cookies } from "next/headers";

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
    // Store successful join in a cookie so they don't have to enter passcode again
    const cookieStore = await cookies();
    cookieStore.set(`joined_meeting_${meetingId}`, roomName, { maxAge: 60 * 60 * 24 });
    redirect(`/livekit?room=${roomName}`);
  }

  return { success: false, errorMessage: "Meeting room not available" };
}
