"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { apiPost, apiGet } from "@/src/lib/api-client";


export async function getStudentGroupsAction() {
  try {
    const res = await apiGet<{ status: string; data: any[] }>("/groups/my-groups", {
      cache: "no-store",
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to load your groups",
    };
  }
}

export async function getPendingInvitationsAction() {
  try {
    const res = await apiGet<{ status: string; data: any[] }>("/groups/invitations/pending", {
      cache: "no-store",
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load invitations" };
  }
}

export async function acceptInvitationAction(invitationId: string) {
  try {
    const res = await apiPost(`/groups/invitations/${invitationId}/accept`, {});
    updateTag("student-invitations");
    updateTag("student-groups");
    updateTag("dashboard");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to accept invitation" };
  }
}

export async function rejectInvitationAction(invitationId: string) {
  try {
    await apiPost(`/groups/invitations/${invitationId}/reject`, {});
    updateTag("student-invitations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject invitation" };
  }
}
