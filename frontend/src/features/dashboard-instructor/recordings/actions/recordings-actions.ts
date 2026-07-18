"use server";
import { apiGet, apiDelete } from "@/src/lib/api-client";
import { revalidatePath } from "next/cache";
export interface RecordingDTO {
  id: string;
  meetingId: string;
  title: string;
  description?: string;
  gDriveViewLink: string;
  gDriveDirectLink?: string;
  duration: number;
  status: "STARTING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  image?: string;
  dateTime?: string;
}
export async function getRecordingsAction(): Promise<RecordingDTO[]> {
  try {
    const res = await apiGet<{ data: RecordingDTO[] }>("/recordings", {
      cache: "no-store"
    });
    return res.data || [];
  } catch (error) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Failed to fetch recordings:", error);
    return [];
  }
}
export async function deleteRecordingAction(recordingId: string) {
  try {
    await apiDelete(`/recordings/${recordingId}`);
    revalidatePath("/dashboard-instructor/recordings", "page");
    revalidatePath("/dashboard-student/recordings", "page");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, errorMessage: error.message || "Failed to delete recording" };
  }
}
import { cookies } from "next/headers";
export async function toggleStudentRecordingAction(allowed: boolean): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("allowStudentRecording", String(allowed), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}
export async function getStudentRecordingPermissionAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const val = cookieStore.get("allowStudentRecording")?.value;
  if (val === "false") return false;
  return true;
}
