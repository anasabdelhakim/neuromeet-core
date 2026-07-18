"use server";

import { apiPost, apiGet, apiDelete, apiPatch } from "@/src/lib/api-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";

const createMeetingSchema = z.object({
  title: z.string().optional().nullable(),
  type: z.string(),
  scheduledAtIso: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === "schedule") {
    if (!data.scheduledAtIso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date and Start time are required for scheduling." });
    }
    if (!data.title || data.title.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lecture Topic is required for scheduling (min 3 chars)." });
    }
  }
});

export async function startMeetingAction(meetingId: string, prevState: any, formData: FormData) {
  let roomName = "";
  try {
    const res = await apiPost<any>(`/meetings/${meetingId}/start`, {});
    roomName = res.data?.livekitRoomName;
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to start meeting:", error.message);
    // Smoothly revalidate only the specific tabs where meetings are shown
    revalidatePath("/dashboard-instructor");          // Today's meetings
    revalidatePath("/dashboard-instructor/upcoming"); // Upcoming meetings
    
    if (error.message && error.message.toLowerCase().includes("ended")) {
       // Return a silent failure so the form stops spinning, and the revalidation smoothly removes the card
       return { success: false, errorMessage: "" };
    }

    return { success: false, errorMessage: error.message || "Failed to start meeting" };
  }

  if (roomName) {
    redirect(`/livekit?room=${roomName}`);
  }

  return { success: false, errorMessage: "Meeting room not returned" };
}

export async function shareMeetingAction(meetingId: string, groupId: string) {
  try {
    const res = await apiPost<any>(`/meetings/${meetingId}/share`, { groupId });
    return { success: true, passcode: res.data?.passcode };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to share meeting:", error.message);
    return { success: false, errorMessage: error.message || "Failed to share meeting" };
  }
}

export async function deleteMeetingAction(meetingId: string) {
  try {
    await apiDelete<any>(`/meetings/${meetingId}`);
    revalidatePath("/dashboard-instructor", "layout");
    revalidatePath("/dashboard-instructor/upcoming");
    revalidatePath("/dashboard-instructor/previous");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to delete meeting" };
  }
}

export async function endMeetingAction(meetingId: string) {
  try {
    await apiPost<any>(`/meetings/${meetingId}/end`, {});
    revalidatePath("/dashboard-instructor", "layout");
    revalidatePath("/dashboard-instructor/upcoming");
    revalidatePath("/dashboard-instructor/previous");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to end meeting" };
  }
}

export async function editMeetingAction(meetingId: string, data: { title: string; scheduledAt: string; durationMinutes?: number }) {
  try {
    await apiPatch<any>(`/meetings/${meetingId}`, data);
    revalidatePath("/dashboard-instructor");
    revalidatePath("/dashboard-instructor/upcoming");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to edit meeting" };
  }
}

export async function createMeetingAction(prevState: any, formData: FormData) {
  let finalRedirectUrl = "/dashboard-instructor/upcoming";

  try {
    const parsed = createMeetingSchema.safeParse({
      title: formData.get("title"),
      type: formData.get("type"),
      scheduledAtIso: formData.get("scheduledAtIso"),
    });

    if (!parsed.success) {
      return { success: false, errorMessage: parsed.error.issues[0].message };
    }

    const { type, scheduledAtIso } = parsed.data;
    const title = parsed.data.title || "Immediate Session";

    let scheduledAt = new Date().toISOString();
    let durationMinutes = 60; 

    if (type === "schedule") {
      const localD = new Date(scheduledAtIso!);

      const fiveMinsAgo = new Date();
      fiveMinsAgo.setMinutes(fiveMinsAgo.getMinutes() - 5);

      if (localD < fiveMinsAgo) {
        return { success: false, errorMessage: "Start time cannot be in the past." };
      }

      scheduledAt = localD.toISOString();
    }

    let groupId: string | undefined = undefined;

    const payload = {
      title,
      scheduledAt,
      durationMinutes,
      groupId,
    };

    const createRes = await apiPost<any>("/meetings", payload);
    const newMeeting = createRes.data;

    if (type === "instant" && newMeeting?.id) {
       try {
         const startRes = await apiPost<any>(`/meetings/${newMeeting.id}/start`, {});
         if (startRes.data?.livekitRoomName) {
           finalRedirectUrl = `/livekit?room=${startRes.data.livekitRoomName}`;
         }
       } catch (e) {
    if ((e as any)?.message === "NEXT_REDIRECT" || (e as any)?.digest?.startsWith("NEXT_REDIRECT")) throw e;
         console.error("Failed to auto-start instant meeting:", e);
       }
    }
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to create meeting" };
  }

  revalidatePath("/dashboard-instructor");
  revalidatePath("/dashboard-instructor/upcoming");
  redirect(finalRedirectUrl);
}

export async function getUpcomingMeetings() {
  try {
    const res = await apiGet<any>("/meetings/upcoming");
    let rawMeetings = res.data || [];

    rawMeetings = rawMeetings.filter((m: any) => {
      if (m.status === "ENDED") return false;
      return true;
    });

    rawMeetings.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);
      return {
        id: m.id,
        title: m.title,
        group: m.group,
        groupName: m.group?.name || "General",
        date: format(d, "MMMM d, yyyy"),
        time: format(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: m.durationMinutes || 60,
        status: m.status,
        passcode: m.passcode,
        participants: m.participants || []
      };
    });
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch upcoming meetings:", error);
    throw error;
  }
}

export async function getTodayMeetings() {
  try {
    const res = await apiGet<any>("/meetings/today");
    let rawMeetings = res.data || [];

    rawMeetings = rawMeetings.filter((m: any) => {
      if (m.status === "ENDED") return false;
      return true;
    });

    return rawMeetings.map((m: any) => {
      const d = new Date(m.scheduledAt);
      return {
        id: m.id,
        title: m.title,
        group: m.group,
        groupName: m.group?.name || "General",
        date: format(d, "MMMM d, yyyy"),
        time: format(d, "h:mm a"),
        dateTime: m.scheduledAt,
        duration: m.durationMinutes || 60,
        status: m.status,
        passcode: m.passcode,
        participants: m.participants || []
      };
    });
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch today's meetings:", error);
    throw error;
  }
}

const joinSessionSchema = z.object({
  roomCode: z.string().min(1, "Room code or link is required").refine((val) => val.trim().length >= 3, {
    message: "Please enter a valid room code or URL (min 3 characters)",
  }),
});

export async function joinSessionAction(prevState: any, formData: FormData) {
  let finalRedirectUrl = "";
  try {
    const parsed = joinSessionSchema.safeParse({
      roomCode: formData.get("roomCode"),
    });

    if (!parsed.success) {
      return { success: false, errorMessage: parsed.error.issues[0].message };
    }

    const roomCode = parsed.data.roomCode.trim();
    try {
      const url = new URL(roomCode);
      finalRedirectUrl = roomCode;
    } catch {
      finalRedirectUrl = `/livekit?room=${roomCode}`;
    }
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Invalid room code" };
  }

  redirect(finalRedirectUrl);
}

export async function leaveMeetingAction(meetingId: string) {
  try {
    await apiPost<any>(`/meetings/${meetingId}/leave`, {});
    revalidatePath("/dashboard-instructor", "layout");
    revalidatePath("/dashboard-student", "layout");
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to leave meeting:", error);
  }
}
