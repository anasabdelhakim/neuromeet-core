// SECURITY: This is a server-side Next.js Route Handler.
// It acts as a proxy to initiate the Google OAuth flow.
// The real NestJS backend URL (NESTJS_URL) is a private server-only env var
// and is NEVER exposed to the browser. The user's browser only ever sees
// a redirect to /api/auth/google on the Next.js domain.
import { NextResponse } from "next/server";

export async function GET() {
  const nestjsUrl = process.env.NESTJS_URL;

  // Hard fail if the env var is missing — never silently fall back to a broken URL
  if (!nestjsUrl) {
    console.error("[OAuth Proxy] NESTJS_URL is not configured.");
    return NextResponse.redirect(
      new URL(
        "/sign-in?error=oauth_misconfigured",
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
      ),
    );
  }

  // Redirect the browser to the NestJS Google OAuth initiation endpoint.
  // NestJS + Passport takes it from here and redirects to Google accounts.
  return NextResponse.redirect(`${nestjsUrl}/auth/google/sign`);
}
