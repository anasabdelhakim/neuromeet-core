"use server";

import { apiDelete } from "@/src/lib/api-client";

export async function kickParticipantAction(room: string, identity: string) {
  try {
    await apiDelete("/livekit/participant", { room, identity });
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to kick participant:", error);
    return { success: false, errorMessage: error.message };
  }
}

export async function restartBotAction(room: string) {
  try {
    const { apiGet } = await import("@/src/lib/api-client");
    await apiGet(`/livekit/token?room=${room}&user=instructor_restart&role=INSTRUCTOR`);
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to restart bot:", error);
    return { success: false, errorMessage: error.message };
  }
}
