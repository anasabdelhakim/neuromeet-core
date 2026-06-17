"use server";

import { apiPost } from "@/src/lib/api-client";

export async function endMeetingAction(roomId: string) {
  try {
    await apiPost("/meetings/end", { roomId });
    return { success: true };
  } catch (error) {
    console.error("Failed to end meeting via Server Action:", error);
    return { success: false };
  }
}
