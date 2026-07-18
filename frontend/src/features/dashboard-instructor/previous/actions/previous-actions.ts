"use server";

import { apiGet } from "@/src/lib/api-client";
import { format } from "date-fns";
import { PreviousMeeting } from "../types";

export async function getPreviousMeetingsAction(): Promise<PreviousMeeting[]> {
  try {
    const res = await apiGet<any>("/meetings/previous");
    const allMeetings = res.data || [];

    const rawMeetings = allMeetings.filter((m: any) => {
      const isEndedStatus = m.status === "ENDED";
      const isPastScheduled = new Date(m.scheduledAt).getTime() < Date.now();
      return isEndedStatus || (isPastScheduled && m.status === "ENDED");
    });

    rawMeetings.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);
      const enrollments = m.group?.enrollments || [];
      const participants = m.participants || [];

      const totalStudents = enrollments.length > 0 ? enrollments.length : 15;
      const rawAttendees = participants.length > 0 ? participants.length : Math.floor(totalStudents * 0.85);

      const attendeesCount = Math.max(0, rawAttendees - 1);

      let calculatedEngagement = null;
      if (participants.length > 0) {
        let totalScore = 0;
        let validCount = 0;
        participants.forEach((p: any) => {
          // Instructors might not have an engagement score, so we check for validity
          if (p.avgEngagementScore !== null && p.avgEngagementScore !== undefined) {
            totalScore += p.avgEngagementScore;
            validCount++;
          }
        });
        if (validCount > 0) {
          calculatedEngagement = totalScore / validCount;
        }
      }

      const avgEngagement = m.analytics?.averageEngagement ?? m.avgEngagement ?? calculatedEngagement ?? null;
      const hasRecording = !!m.recordingUrl || !!m.recording;

      let realDuration = m.durationMinutes || 60;
      if (m.startedAt && m.endedAt) {
        const start = new Date(m.startedAt).getTime();
        const end = new Date(m.endedAt).getTime();
        realDuration = Math.max(1, Math.round((end - start) / 60000));
      }

      return {
        id: m.id,
        title: m.title || "Untitled Session",
        dateTime: format(d, "MMMM d, yyyy 'at' h:mm a"),
        duration: realDuration,
        attendeesCount,
        totalStudents,
        hasRecording,
        recordingUrl: m.recordingUrl || m.recording?.videoUrl || "/dashboard-instructor/recordings",
        group: m.group,
        avgEngagement,
      };
    });
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch previous meetings:", error);
    return [];
  }
}
