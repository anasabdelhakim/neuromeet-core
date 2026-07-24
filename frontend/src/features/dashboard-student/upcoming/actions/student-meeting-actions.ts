"use server";

import { apiGet, apiPost } from "@/src/lib/api-client";
import { formatEgyptTime } from "@/src/lib/format-date";
import { redirect } from "next/navigation";

export async function getStudentUpcomingMeetings() {
  try {
    const res = await apiGet<any>("/meetings/student/upcoming");
    const rawMeetings = res.data || [];

    rawMeetings.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);

      let realDuration = m.durationMinutes || 60;
      if (m.startedAt && m.endedAt) {
        const start = new Date(m.startedAt).getTime();
        const end = new Date(m.endedAt).getTime();
        const calculated = Math.max(1, Math.round((end - start) / 60000));
        const maxReasonable = (m.durationMinutes || 60) * 3;
        realDuration = calculated > maxReasonable ? (m.durationMinutes || 60) : calculated;
      }

      return {
        id: m.id,
        title: m.title,
        group: m.group,
        groupName: m.group?.name || "General",
        date: formatEgyptTime(d, "MMMM d, yyyy"),
        time: formatEgyptTime(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: realDuration,
        status: m.status,
      };
    });
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch student upcoming meetings:", error);
    throw error;
  }
}

export async function getStudentTodayMeetings() {
  try {
    const res = await apiGet<any>("/meetings/student/today");
    const rawMeetings = res.data || [];
    rawMeetings.sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);

      let realDuration = m.durationMinutes || 60;
      if (m.startedAt && m.endedAt) {
        const start = new Date(m.startedAt).getTime();
        const end = new Date(m.endedAt).getTime();
        const calculated = Math.max(1, Math.round((end - start) / 60000));
        const maxReasonable = (m.durationMinutes || 60) * 3;
        realDuration = calculated > maxReasonable ? (m.durationMinutes || 60) : calculated;
      }

      return {
        id: m.id,
        title: m.title,
        group: m.group,
        groupName: m.group?.name || "General",
        date: formatEgyptTime(d, "MMMM d, yyyy"),
        time: formatEgyptTime(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: realDuration,
        status: m.status,
      };
    });
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch student today meetings:", error);
    throw error;
  }
}

export async function getStudentPreviousMeetings() {
  try {
    const res = await apiGet<any>("/meetings/student/previous");
    return res.data || [];
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch student previous meetings:", error);
    throw error;
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
    const isGuest = res.data?.isGuest;
    if (isGuest) {
      roomName += "&guest=true";
    }
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to join meeting" };
  }

  if (roomName) {

    const cookieStore = await cookies();
    cookieStore.set(`joined_meeting_${meetingId}`, roomName, { maxAge: 60 * 60 * 24 });
    redirect(`/livekit?room=${roomName}`);
  }

  return { success: false, errorMessage: "Meeting room not available" };
}

export async function studentNavigateToJoinAction(meetingId: string) {
  redirect(`/meeting/join/${meetingId}`);
}
