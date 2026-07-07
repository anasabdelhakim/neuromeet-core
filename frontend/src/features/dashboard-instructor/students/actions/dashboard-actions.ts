"use server";

import { apiGet, apiPost, apiDelete } from "@/src/lib/api-client";
import { updateTag } from "next/cache";

export async function getDashboardData() {
  try {
    const res = await apiGet<{ status: string; data: any }>("/groups/dashboard/data", {
      cache: "force-cache",
      next: { tags: ["instructor-groups", "dashboard"] },
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch dashboard data" };
  }
}

export async function getAllStudents() {
  try {
    const res = await apiGet<{ status: string; data: any[] }>("/groups/dashboard/students", {
      cache: "force-cache",
      next: { tags: ["students"] },
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch students" };
  }
}

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  try {
    await apiDelete(`/groups/${groupId}/students/${studentId}`);
    updateTag("instructor-groups");
    updateTag("dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove student" };
  }
}
