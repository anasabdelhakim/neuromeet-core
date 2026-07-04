"use server";

import { apiDelete } from "@/src/lib/api-client";

export async function kickParticipantAction(room: string, identity: string) {
  try {
    await apiDelete("/livekit/participant", { room, identity });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to kick participant:", error);
    return { success: false, errorMessage: error.message };
  }
}
