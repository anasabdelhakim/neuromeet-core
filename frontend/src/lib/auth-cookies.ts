import 'server-only';
import { cookies } from 'next/headers';

// ---------- JWT Auth Cookies ----------
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // SECURITY: 'httpOnly: true' prevents JavaScript from accessing the cookie containing the JWT.
  // This is the primary defense against Cross-Site Scripting (XSS) attacks stealing tokens.
  // 'secure: true' in production ensures cookies are only sent over HTTPS.
  // 'sameSite: lax' provides CSRF mitigation by not sending the cookie on cross-site sub-requests.
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour (matches access token expiry)
  });
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days (matches refresh token expiry)
  });
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get('access_token')?.value || null,
    refreshToken: cookieStore.get('refresh_token')?.value || null,
  };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

// ---------- Reset Flow Cookies ----------
export async function setResetEmail(email: string) {
  const cookieStore = await cookies();
  cookieStore.set('reset_email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });
}

export async function getResetEmail() {
  const cookieStore = await cookies();
  return cookieStore.get('reset_email')?.value || '';
}

export async function setResetToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('reset_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes (matches backend expiry)
  });
}

export async function getResetToken() {
  const cookieStore = await cookies();
  return cookieStore.get('reset_token')?.value || '';
}

export async function clearResetData() {
  const cookieStore = await cookies();
  cookieStore.delete('reset_email');
  cookieStore.delete('reset_token');
}

// ---------- OTP Resend Timer Cookie ----------
// SECURITY: The resend cooldown is enforced via an HTTP-only cookie storing
// the Unix timestamp (ms) when the OTP was last sent. Because the cookie is
// httpOnly, client-side JavaScript cannot read or modify it, preventing
// attackers from bypassing the resend cooldown via DevTools.

const OTP_COOLDOWN_SECONDS = 120; // 2 minutes

export async function setOtpSentAt() {
  const cookieStore = await cookies();
  cookieStore.set('otp_sent_at', Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OTP_COOLDOWN_SECONDS,
  });
}

export async function getOtpSecondsRemaining(): Promise<number> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('otp_sent_at')?.value;
  if (!raw) return 0;

  const sentAt = parseInt(raw, 10);
  if (isNaN(sentAt)) return 0;

  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, OTP_COOLDOWN_SECONDS - elapsed);
}
