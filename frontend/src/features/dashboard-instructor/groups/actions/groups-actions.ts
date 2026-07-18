"use server";

import { apiGet, apiPost, apiPatch, apiDelete } from "@/src/lib/api-client";
import { revalidatePath, updateTag } from "next/cache";
import { Group, CreateGroupState } from "../types/groups-types";

export async function createGroupAction(
  _prev: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;

  try {
    const res = await apiPost<{ status: string; data: Group }>(
      "/groups",
      {
        name: name?.trim(),
        subject: subject?.trim(),
        description: description?.trim(),
      }
    );
    revalidatePath("/dashboard-instructor/groups");
    revalidatePath("/dashboard-instructor");
    updateTag("instructor-groups");
    return { success: true, data: res.data };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to create group" };
  }
}

export async function updateGroupAction(
  groupId: string,
  _prev: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;

  try {
    const res = await apiPatch<{ status: string; data: Group }>(
      `/groups/${groupId}`,
      {
        name: name?.trim() || undefined,
        subject: subject?.trim() || undefined,
        description: description?.trim() || undefined,
      }
    );
    revalidatePath("/dashboard-instructor/groups");
    revalidatePath("/dashboard-instructor");
    updateTag("instructor-groups");
    return { success: true, data: res.data };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to update group" };
  }
}

export async function deleteGroupAction(groupId: string) {
  try {
    await apiDelete(`/groups/${groupId}`);
    revalidatePath("/dashboard-instructor/groups");
    revalidatePath("/dashboard-instructor");
    updateTag("instructor-groups");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to delete group" };
  }
}

export async function getGroupsAction() {
  try {
    const res = await apiGet<{ status: string; data: Group[] }>("/groups");
    return { success: true, data: res.data };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to fetch groups" };
  }
}

export async function inviteStudentToGroup(groupId: string, studentId: string) {
  try {
    await apiPost(`/groups/${groupId}/invitations`, { studentId });
    updateTag("instructor-groups");
    updateTag("dashboard");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to invite student" };
  }
}

export async function undoInvitationToGroup(groupId: string, studentId: string) {
  try {
    await apiDelete(`/groups/${groupId}/invitations/${studentId}`);
    updateTag("instructor-groups");
    updateTag("dashboard");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to undo invitation" };
  }
}

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  try {
    await apiDelete(`/groups/${groupId}/students/${studentId}`);
    updateTag("instructor-groups");
    updateTag("dashboard");
    return { success: true };
  } catch (error: any) {
    if ((error as any)?.message === "NEXT_REDIRECT" || (error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, error: error.message || "Failed to remove student" };
  }
}
