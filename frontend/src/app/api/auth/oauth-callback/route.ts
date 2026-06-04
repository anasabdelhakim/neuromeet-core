// SECURITY: This Next.js Route Handler implements the BFF Handshake Pattern.
// It securely intercepts the short-lived "handoffToken" from the URL,
// makes a server-to-server POST call to exchange it for the real access and refresh tokens,
// and saves those tokens using the existing httpOnly secure cookies function.
// This prevents cross-domain cookie issues and eliminates server-side session memory leaks.

import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/src/lib/auth-cookies";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handoffToken = searchParams.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;

  if (!handoffToken) {
    console.error("[BFF Handshake] Handoff token is missing.");
    return NextResponse.redirect(new URL("/sign-in?error=invalid_handoff", baseUrl));
  }

  const nestjsUrl = process.env.NESTJS_URL;
  if (!nestjsUrl) {
    console.error("[BFF Handshake] NESTJS_URL is not configured.");
    return NextResponse.redirect(new URL("/sign-in?error=oauth_misconfigured", baseUrl));
  }

  try {
    // 1️⃣ Secretly exchange the handoffToken for the real access_token and refresh_token
    const response = await fetch(`${nestjsUrl}/auth/google/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: handoffToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BFF Handshake] Token exchange failed:", errorText);
      return NextResponse.redirect(new URL("/sign-in?error=exchange_failed", baseUrl));
    }

    const resData = await response.json();

    if (!resData.access_token || !resData.refresh_token) {
      console.error("[BFF Handshake] Missing tokens in response:", resData);
      return NextResponse.redirect(new URL("/sign-in?error=missing_tokens", baseUrl));
    }

    // 2️⃣ Securely store the tokens in httpOnly cookies
    await setAuthCookies(resData.access_token, resData.refresh_token);

    // 3️⃣ Determine route based on user's role and redirect to the dashboard
    const redirectPath =
      resData.data?.role === "STUDENT"
        ? "/dashboard-student"
        : "/dashboard-instructor";

    return NextResponse.redirect(new URL(redirectPath, baseUrl));
  } catch (error) {
    console.error("[BFF Handshake] Error occurred during exchange:", error);
    return NextResponse.redirect(new URL("/sign-in?error=exchange_error", baseUrl));
  }
}
