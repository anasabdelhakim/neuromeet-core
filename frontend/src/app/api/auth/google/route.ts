// SECURITY: This is a server-side Next.js Route Handler.
// It acts as a proxy to initiate the Google OAuth flow.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const nestjsUrl = process.env.NESTJS_URL;

  if (!nestjsUrl) {
    console.error("[OAuth Proxy] NESTJS_URL is not configured.");
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_misconfigured", req.url)
    );
  }

  // Redirect the browser to the NestJS Google OAuth initiation endpoint.
  return NextResponse.redirect(`${nestjsUrl}/auth/google/sign`);
}