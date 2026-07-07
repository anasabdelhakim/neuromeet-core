"use server";

import { apiGet, apiPatch } from "@/src/lib/api-client";
import { NotificationData } from "@/src/features/dashboard-instructor/layout/NotificationDropdown";

export async function getNotificationsAction(): Promise<NotificationData[]> {
  try {
    const res = await apiGet<{ status: string; data: NotificationData[] }>('/notifications');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    return [];
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    await apiPatch(`/notifications/${id}/read`, {});
    return { success: true };
  } catch (error) {
    console.error(`Failed to mark notification ${id} as read`, error);
    return { success: false };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    await apiPatch(`/notifications/read-all`, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read", error);
    return { success: false };
  }
}
