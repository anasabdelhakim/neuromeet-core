'use server';

// =========================
// SERVER ACTIONS — AUTHENTICATION LAYER
// =========================
// SECURITY: Next.js Server Actions execute code securely on the server.
// This hides the NestJS API URL and all payload structures from the client's
// Network tab, minimizing the attack surface. The browser only ever sees
// requests to the Next.js domain.

import { redirect } from 'next/navigation';
import { apiPost, ApiError } from '@/src/lib/api-client';
import {
  setAuthCookies,
  setResetEmail,
  getResetEmail,
  setResetToken,
  getResetToken,
  clearResetData,
  setOtpSentAt,
  getOtpSecondsRemaining,
} from '@/src/lib/auth-cookies';
import {
  loginFormSchema,
  SignUpFormSchema,
  forgetPasswordSchema,
  otpFormSchema,
  resetPasswordSchema,
} from '@/src/validations/zod';

// ---------- Shared result type ----------
export type ActionResult = {
  success: boolean;
  errorMessage: Record<string, string[]>;
};

// ---------- NestJS response types ----------
interface AuthResponse {
  status: string;
  data: { id: string; name: string; email: string; role: 'PATIENT' | 'DOCTOR' };
  access_token: string;
  refresh_token: string;
}

interface SignUpResponse {
  status: string;
  message: string;
  data: { id: string; name: string; email: string; role: 'PATIENT' | 'DOCTOR' };
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
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

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
    const res = await apiPost<AuthResponse>('/auth/sign-in', {
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // SECURITY: Store tokens in HTTP-only cookies, never in localStorage/sessionStorage.
    // This prevents XSS attacks from stealing tokens via document.cookie or JS access.
    await setAuthCookies(res.access_token, res.refresh_token);

    const redirectPath = res.data.role === 'DOCTOR' ? '/doctor' : '/patient';
    redirect(redirectPath);
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
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
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
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
    await apiPost<SignUpResponse>('/auth/sign-up', {
      name: parsed.data.username,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // SECURITY: Only store the email in a cookie for the OTP verification step.
    // NO tokens are set here — the user must complete email verification first.
    await setResetEmail(parsed.data.email);
    await setOtpSentAt();

    redirect('/verify-email?flow=signup');
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
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
    email: formData.get('email') as string,
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
    await apiPost<MessageResponse>('/auth/reset-password', {
      email: parsed.data.email,
    });

    await setResetEmail(parsed.data.email);
    await setOtpSentAt();

    redirect('/verify-email?flow=reset');
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
    }
    throw err;
  }
}

// =========================
// VERIFY CODE
// =========================
// SECURITY: This action handles TWO different flows:
//   - signup: calls /auth/signup-code → receives JWT tokens → sets cookies → redirect to /patient
//   - reset:  calls /auth/verify-code → receives resetToken → stores in cookie → redirect to /reset-password
export async function verifyCodeAction(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const value = {
    otp: formData.get('otp') as string,
  };
  const flow = (formData.get('flow') as string) || 'reset';

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

  try {
    const email = await getResetEmail();
    if (!email) {
      return {
        success: false,
        errorMessage: { server: ['Session expired. Please start over.'] },
      };
    }

    if (flow === 'signup') {
      // SECURITY: Sign-up flow — verify email and receive first-time JWT tokens.
      // Tokens are ONLY issued AFTER successful OTP verification.
      const res = await apiPost<VerifyCodeResponse>('/auth/signup-code', {
        email,
        code: parsed.data.otp,
      });

      // Now that email is verified, set auth cookies for the first time.
      if (res.access_token && res.refresh_token) {
        await setAuthCookies(res.access_token, res.refresh_token);
      }

      redirect('/patient');
    } else {
      // SECURITY: Password reset flow — verify OTP and receive a one-time resetToken.
      // The resetToken is stored in an HTTP-only cookie and required by /auth/change-password.
      const res = await apiPost<VerifyCodeResponse>('/auth/verify-code', {
        email,
        code: parsed.data.otp,
      });

      if (res.resetToken) {
        await setResetToken(res.resetToken);
      }

      redirect('/reset-password');
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
    }
    throw err;
  }
}

// =========================
// RESEND CODE (no FormData — called directly, not via useActionState)
// =========================
// SECURITY: Server-side cooldown enforcement via HTTP-only cookie timestamp.
// Attackers cannot bypass the cooldown via DevTools because the cookie is httpOnly.
export async function resendCodeAction(): Promise<
  ActionResult & { secondsRemaining?: number }
> {
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
        errorMessage: { server: ['Session expired. Please start over.'] },
      };
    }

    await apiPost<MessageResponse>('/auth/reset-password', { email });
    await setOtpSentAt();

    return { success: true, errorMessage: {}, secondsRemaining: 120 };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
    }
    return {
      success: false,
      errorMessage: { server: ['Failed to resend code'] },
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
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
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
          server: ['Session expired. Please start the reset process again.'],
        },
      };
    }

    // SECURITY: The resetToken ties this request to a verified OTP session.
    // Without it, an attacker cannot change anyone's password.
    await apiPost<MessageResponse>('/auth/change-password', {
      email,
      password: parsed.data.password,
      resetToken,
    });

    // SECURITY: Clear all reset-flow cookies after successful password change.
    await clearResetData();

    redirect('/sign-in');
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, errorMessage: { server: [err.message] } };
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
  const { clearAuthCookies } = await import('@/src/lib/auth-cookies');
  await clearAuthCookies();
  redirect('/sign-in');
}
