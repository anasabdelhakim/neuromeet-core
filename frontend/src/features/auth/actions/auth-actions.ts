"use server";

// =========================
// SERVER ACTIONS — AUTHENTICATION LAYER
// =========================
// SECURITY: Next.js Server Actions execute code securely on the server.
// This hides the NestJS API URL and all payload structures from the client's
// Network tab, minimizing the attack surface. The browser only ever sees
// requests to the Next.js domain.

import { redirect } from "next/navigation";
import { apiPost, ApiError, apiGet, apiPatch, apiDelete } from "@/src/lib/api-client";
import {
  setAuthCookies,
  getAuthCookies,
  clearAuthCookies,
  setResetEmail,
  getResetEmail,
  setResetToken,
  getResetToken,
  clearResetData,
  setOtpSentAt,
  getOtpSecondsRemaining,
  setMeetingRedirectUrl,
  getMeetingRedirectUrl,
  clearMeetingRedirectUrl,
} from "@/src/lib/auth-cookies";
import {
  loginFormSchema,
  SignUpFormSchema,
  forgetPasswordSchema,
  otpFormSchema,
  resetPasswordSchema,
} from "@/src/validations/zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// ---------- Shared result type ----------
export type ActionResult = {
  success: boolean;
  errorMessage: Record<string, string[]>;
};

// ---------- NestJS response types ----------
interface AuthResponse {
  status: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: "INSTRUCTOR" | "STUDENT" | "ADMIN";
    isProfileComplete?: boolean;
    avatarUrl?: string;
  };
  access_token: string;
  refresh_token: string;
}

interface SignUpResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: "INSTRUCTOR" | "STUDENT" | "ADMIN";
  };
}

interface MessageResponse {
  status: string;
  message: string;
}

interface VerifyCodeResponse extends MessageResponse {
  resetToken?: string;
  access_token?: string;
  refresh_token?: string;
}

// =========================
// SIGN IN
// =========================
export async function signInAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const redirectTo = formData.get("redirectTo") as string;

  // SECURITY: Double-layer validation — Zod validates on the server even though
  // the client also validates. This prevents bypassing client-side checks.
  const parsed = loginFormSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const res = await apiPost<AuthResponse>("/auth/sign-in", {
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // SECURITY: Store tokens in HTTP-only cookies, never in localStorage/sessionStorage.
    // This prevents XSS attacks from stealing tokens via document.cookie or JS access.
    await setAuthCookies(res.access_token, res.refresh_token);

    let redirectPath = redirectTo || "";
    if (!redirectPath) {
      redirectPath = await getMeetingRedirectUrl();
      if (redirectPath) {
        await clearMeetingRedirectUrl();
      }
    }

    if (!redirectPath) {
      switch (res.data.role) {
        case "ADMIN":
          redirectPath = "/dashboard-admin";
          break;
        case "STUDENT":
          redirectPath = "/dashboard-student";
          break;
        default:
          redirectPath = "/dashboard-instructor";
      }
    }

    redirect(redirectPath);
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    throw err; // re-throw redirect errors (Next.js uses throw internally for redirect)
  }
}

// =========================
// SIGN UP
// =========================
// SECURITY: Sign-up does NOT issue tokens. The backend only sends OTP.
// Tokens are issued after the user verifies their email via verifyCodeSignUp.
// This prevents unverified users from having a valid session.
export async function signUpAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = SignUpFormSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await apiPost<SignUpResponse>("/auth/sign-up", {
      name: parsed.data.username,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // SECURITY: Only store the email in a cookie for the OTP verification step.
    // NO tokens are set here — the user must complete email verification first.
    await setResetEmail(parsed.data.email);
    await setOtpSentAt();

    redirect("/verify-email?flow=signup");
  } catch (err:any) {
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    throw err;
  }
}

// =========================
// FORGOT PASSWORD
// =========================
export async function forgotPasswordAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    email: formData.get("email") as string,
  };

  const parsed = forgetPasswordSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await apiPost<MessageResponse>("/auth/reset-password", {
      email: parsed.data.email,
    });

    await setResetEmail(parsed.data.email);
    await setOtpSentAt();

    redirect("/verify-email?flow=reset");
  } catch (err:any) {
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    throw err;
  }
}

// =========================
// VERIFY CODE
// =========================
// SECURITY: This action handles TWO different flows:
//   - signup: calls /auth/signup-code → receives JWT tokens → sets cookies → redirect to /dashboard
//   - reset:  calls /auth/verify-code → receives resetToken → stores in cookie → redirect to /reset-password
export async function verifyCodeAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    otp: formData.get("otp") as string,
  };
  const flow = (formData.get("flow") as string) || "reset";

  const parsed = otpFormSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  let redirectPath = "/";

  try {
    const email = await getResetEmail();
    if (!email) {
      return {
        success: false,
        errorMessage: { server: ["Session expired. Please start over."] },
      };
    }

    if (flow === "signup") {
      const res = await apiPost<VerifyCodeResponse>("/auth/signup-code", {
        email,
        code: parsed.data.otp,
      });

      if (res.access_token && res.refresh_token) {
        await setAuthCookies(res.access_token, res.refresh_token);
        await clearResetData();
      }

      redirectPath = "/setting-profile";
    } else {
      const res = await apiPost<VerifyCodeResponse>("/auth/verify-code", {
        email,
        code: parsed.data.otp,
      });

      if (res.resetToken) {
        await setResetToken(res.resetToken);
      }

      redirectPath = "/reset-password";
    }
  } catch (err:any) {
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    throw err;
  }

  redirect(redirectPath);
}

// =========================
// RESEND CODE (no FormData — called directly, not via useActionState)
// =========================
// SECURITY: Server-side cooldown enforcement via HTTP-only cookie timestamp.
// Attackers cannot bypass the cooldown via DevTools because the cookie is httpOnly.
export async function resendCodeAction(
  flow: string = "reset",
): Promise<ActionResult & { secondsRemaining?: number }> {
  try {
    const remaining = await getOtpSecondsRemaining();
    if (remaining > 0) {
      return {
        success: false,
        errorMessage: {
          server: [`Please wait ${remaining} seconds before resending.`],
        },
        secondsRemaining: remaining,
      };
    }

    const email = await getResetEmail();
    if (!email) {
      return {
        success: false,
        errorMessage: { server: ["Session expired. Please start over."] },
      };
    }

    if (flow === "signup") {
      await apiPost<MessageResponse>("/auth/resend-signup-code", { email });
    } else {
      await apiPost<MessageResponse>("/auth/reset-password", { email });
    }

    await setOtpSentAt();

    return { success: true, errorMessage: {}, secondsRemaining: 120 };
  } catch (err:any) {
    console.error("resendCodeAction error:", err);
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    return {
      success: false,
      errorMessage: {
        server: [err.message],
      },
    };
  }
}

// =========================
// GET RESEND TIMER (secure server-side timer check)
// =========================
export async function getResendTimerAction(): Promise<{
  secondsRemaining: number;
}> {
  const secondsRemaining = await getOtpSecondsRemaining();
  return { secondsRemaining };
}

// =========================
// CHANGE PASSWORD
// =========================
export async function changePasswordAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const email = await getResetEmail();
    const resetToken = await getResetToken();

    if (!email || !resetToken) {
      return {
        success: false,
        errorMessage: {
          server: ["Session expired. Please start the reset process again."],
        },
      };
    }

    // SECURITY: The resetToken ties this request to a verified OTP session.
    // Without it, an attacker cannot change anyone's password.
    await apiPost<MessageResponse>("/auth/change-password", {
      email,
      password: parsed.data.password,
      resetToken,
    });

    // SECURITY: Clear all reset-flow cookies after successful password change.
    await clearResetData();

    redirect("/sign-in");
  } catch (err:any) {
    if (err instanceof ApiError) {
      return {
        success: false,
        errorMessage: { server: [err.message] },
      };
    }
    throw err;
  }
}

// =========================
// SIGN OUT
// =========================
// SECURITY: Clears all auth cookies (access_token + refresh_token) on sign-out.
// Since cookies are HTTP-only, they can ONLY be cleared by the server — not by
// client-side JavaScript. This is why sign-out must be a server action.
export async function signOutAction(): Promise<void> {
  await clearAuthCookies();
  redirect("/sign-in");
}

// =========================
// DELETE ACCOUNT
// =========================
export async function deleteMyAccountAction(): Promise<void> {
  try {
    await apiDelete("/userMe");
    await clearAuthCookies();
    redirect("/sign-in");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("Failed to delete account:", err);
    await clearAuthCookies();
    redirect("/sign-in");
  }
}

// =========================
// UPDATE USER PROFILE
// =========================
export type ProfileSettingsState = {
  success: boolean;
  errorMessage?: {
    avatar?: string[];
    server?: string[];
  };
};

export async function updateUserProfile(
  _prevState: ProfileSettingsState | null,
  formData: FormData
): Promise<ProfileSettingsState> {
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return {
      success: false,
      errorMessage: { server: ["Unauthorized. Please sign in again."] },
    };
  }

  const avatarFile = formData.get("avatar") as File | null;
  if (!avatarFile || avatarFile.size === 0) {
    return {
      success: false,
      errorMessage: { avatar: ["Please select a profile photo to upload."] },
    };
  }

  if (avatarFile.size > 5 * 1024 * 1024) {
    return {
      success: false,
      errorMessage: { avatar: ["File size exceeds 5MB limit."] },
    };
  }

  if (!avatarFile.type.startsWith("image/")) {
    return {
      success: false,
      errorMessage: { avatar: ["Please upload a valid image file (JPG, PNG, WebP)."] },
    };
  }

  try {
    const uploadData = new FormData();
    uploadData.append("avatar", avatarFile);

    const resData = await apiPost<AuthResponse>('/userMe/avatar', uploadData);

    const role = resData.data?.role;
    let redirectPath = await getMeetingRedirectUrl();
    if (redirectPath) {
      await clearMeetingRedirectUrl();
    } else {
      redirectPath = role === "STUDENT" ? "/dashboard-student" : "/dashboard-instructor";
    }
    redirect(redirectPath);
  } catch (err: any) {
    if (isRedirectError(err)) {
      throw err;
    }

    return {
      success: false,
      errorMessage: { server: [err.message || "Something went wrong"] },
    };
  }
}

export async function skipProfileCompletion() {
  const { accessToken } = await getAuthCookies();

  if (!accessToken) redirect("/sign-in");

  try {
    const res = await apiPatch<any>('/userMe', { isProfileComplete: true });
    const role = res.data?.user?.role || res.data?.role;
    let redirectPath = await getMeetingRedirectUrl();
    if (redirectPath) {
      await clearMeetingRedirectUrl();
    } else {
      redirectPath = role === "STUDENT" ? "/dashboard-student" : "/dashboard-instructor";
    }
    redirect(redirectPath);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    redirect("/sign-in");
  }
}

export async function setRedirectCookie(path: string) {
  await setMeetingRedirectUrl(path);
}

import { cache } from 'react';

// =========================
// GET USER PROFILE
// =========================
export const getUserProfile = cache(async () => {
  const { accessToken, refreshToken } = await getAuthCookies();

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    const res = await apiGet<any>('/userMe', { cache: 'force-cache' });
    return res?.data?.user || null;
  } catch (err) {
    return null;
  }
});

