"use server";
import { revalidatePath } from "next/cache";
import { apiGet, apiPatch, apiDelete, ApiError } from "@/src/lib/api-client";
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "INSTRUCTOR" | "STUDENT" | "ADMIN";
  active: boolean;
  isProfileComplete: boolean;
  created_at: string;
  reported?: boolean;
  reportDetails?: string;
}
export interface UsersResponse {
  status: string;
  data: {
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
export async function getUsersAction(params: {
  search?: string;
  role?: string;
  page?: string;
  limit?: string;
}): Promise<UsersResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  const qs = query.toString();
  const endpoint = `/admin/users${qs ? `?${qs}` : ""}`;
  return apiGet<UsersResponse>(endpoint);
}
export async function updateUserRoleAction(userId: string, role: string) {
  try {
    const res = await apiPatch<{ status: string; data: AdminUser }>(
      `/admin/users/${userId}/role`,
      { role }
    );
    if (res?.data) {
      revalidatePath("/dashboard-admin");
      return { success: true, data: res.data };
    }
    return { success: false, error: "Invalid response from server" };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Something went wrong" };
  }
}
export async function deleteUserAction(userId: string) {
  try {
    await apiDelete(`/admin/users/${userId}`);
    revalidatePath("/dashboard-admin");
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Something went wrong" };
  }
}
export interface AdminStats {
  totalStudents: number;
  totalInstructors: number;
  totalMeetings: number;
}
export async function getAdminStatsAction() {
  try {
    const res = await apiGet<{ status: string; data: AdminStats }>('/admin/stats');
    if (res?.data) {
      return { success: true, data: res.data };
    }
    return { success: false, error: "Invalid response" };
  } catch (err) {
    return { success: false, error: "Failed to fetch admin stats" };
  }
}