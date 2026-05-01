"use server";

import { apiPost } from "../lib/apiClient";


export async function handleEmail(_: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { errorMassege: "Please enter your email", success: false };
  }
  try {
    const res: { success: boolean; message: string } = await apiPost(
      "/send-email",
      { email },
    );
    if (res.success) {
      return { errorMassege: "", success: true };
    }
    return { errorMassege: res.message, success: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return { errorMassege: errorMessage, success: false };
  }
}
