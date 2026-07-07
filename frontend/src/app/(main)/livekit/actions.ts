"use server";
import { apiPost } from "@/src/lib/api-client";
import { revalidatePath } from "next/cache";
export async function endMeetingAction(roomId: string) {
  try {
    await apiPost(`/meetings/${roomId}/end`, {});
    revalidatePath("/dashboard-instructor", "layout");
    revalidatePath("/dashboard-student", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to end meeting via Server Action:", error);
    return { success: false };
  }
}
