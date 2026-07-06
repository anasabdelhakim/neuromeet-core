"use server";

import { apiGet, apiPost } from "@/src/lib/api-client";

export interface MeetingListDTO {
  id: string;
  title: string;
  startedAt: string;
}

export interface MeetingAnalyticsDTO {
  kpis: {
    totalParticipants: number;
    avgEngagement: number;
    totalAdhdFlags: number;
    totalMinutes: string | number;
  };
  studentMatrix: Array<{
    name: string;
    avgEngagement: number;
    totalSeconds: number;
    adhdFlags: number;
  }>;
}

export async function getInstructorMeetingsAction(): Promise<MeetingListDTO[]> {
  try {
    const res = await apiGet<MeetingListDTO[]>("/analytics/meetings", {
      cache: "no-store"
    });
    return res || [];
  } catch (error) {
    console.error("Failed to fetch meetings for analytics:", error);
    return [];
  }
}

export async function getMeetingAnalyticsAction(meetingId: string): Promise<MeetingAnalyticsDTO | null> {
  try {
    const res = await apiGet<MeetingAnalyticsDTO>(`/analytics/meeting/${meetingId}`, {
      cache: "no-store"
    });
    return res;
  } catch (error) {
    console.error("Failed to fetch meeting analytics:", error);
    return null;
  }
}

export interface StudentAnalyticsDTO {
  studentName: string;
  kpis: {
    totalMinutes: string | number;
    avgEngagement: number;
    totalAdhdFlags: number;
  };
  timeline: Array<{
    meetingId: string;
    title: string;
    date: string;
    engagement: number;
  }>;
}

export async function getStudentAnalyticsAction(studentId: string): Promise<StudentAnalyticsDTO | null> {
  try {
    const res = await apiGet<StudentAnalyticsDTO>(`/analytics/student/${studentId}`, {
      cache: "no-store"
    });
    return res;
  } catch (error) {
    console.error("Failed to fetch specific student analytics:", error);
    return null;
  }
}

export async function syncEngagementStatsAction(
  meetingId: string, 
  stats: { participantIdentity: string, avgEngagementScore: number, adhdFlagged: boolean }[]
) {
  try {
    await apiPost(`/meetings/${meetingId}/sync-engagement`, { stats });
  } catch (error) {
    console.error("Failed to sync engagement stats:", error);
  }
}

