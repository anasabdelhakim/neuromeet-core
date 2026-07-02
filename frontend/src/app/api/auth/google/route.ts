// SECURITY: This is a server-side Next.js Route Handler.
// It acts as a proxy to initiate the Google OAuth flow.
import { NextResponse } from "next/server";
export async function GET() {
  const nestjsUrl = process.env.NESTJS_URL;

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
  return NextResponse.redirect(`${nestjsUrl}/auth/google/sign`);
}