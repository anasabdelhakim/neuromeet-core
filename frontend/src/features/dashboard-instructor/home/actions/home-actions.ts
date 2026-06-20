"use server";
import { apiGet } from "@/src/lib/api-client";

export async function getDashboardData() {
  try {
    const res = await apiGet<{ status: string; data: any }>("/groups/dashboard/data", {
      cache: "no-store",
    });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch dashboard data" };
  }
}
