import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: Decode the JWT payload robustly at the Edge.
function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // FIX 1: Convert Base64URL to standard Base64 before using atob()
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    
    // Pad with '=' if the length isn't a multiple of 4
    const pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }

    const payload = JSON.parse(atob(base64));

    // FIX 2: Check if the token is expired (exp is in seconds, Date.now is in ms)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("[Middleware] Token is expired.");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[Middleware] Failed to decode JWT:", error);
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // ---------- Route Classifications ----------
  const authRoutes = [
    "/sign-in",
    "/sign-up",
    "/forget-password",
    "/verify-email",
    "/reset-password",
  ];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isInstructorRoute = pathname.startsWith("/dashboard-instructor");
  const isStudentRoute = pathname.startsWith("/dashboard-student");
  const isProtectedRoute = isInstructorRoute || isStudentRoute;

  // ---------- Decode Role & Validate ----------
  // If token exists but is invalid/expired, payload will be null
  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role; // 'INSTRUCTOR' | 'STUDENT' | undefined
  const isValidToken = !!payload;

  // Helper function to dynamically route based on role
  const getCorrectDashboard = (userRole?: string) => {
    if (userRole === "INSTRUCTOR") return "/dashboard-instructor";
    if (userRole === "STUDENT") return "/dashboard-student";
    return "/sign-in"; // Fallback
  };

  // =================================================================
  // RULE 1: Logged-in users visiting auth pages → redirect to THEIR dashboard
  // =================================================================
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(
      new URL(getCorrectDashboard(role), request.url),
    );
  }

  // =================================================================
  // RULE 2: Unauthenticated users visiting ANY protected page → sign in
  // =================================================================
  if (isProtectedRoute && !isValidToken) {
    // Optional: You could pass a ?callbackUrl here so they return after login
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // =================================================================
  // RULE 3: Strict Role-Based Access Control (The Bouncer)
  // =================================================================
  if (isInstructorRoute && role !== "INSTRUCTOR") {
    return NextResponse.redirect(
      new URL(getCorrectDashboard(role), request.url),
    );
  }

  if (isStudentRoute && role !== "STUDENT") {
    return NextResponse.redirect(
      new URL(getCorrectDashboard(role), request.url),
    );
  }

  // =================================================================
  // RULE 4: Root path "/" — redirect logged-in users to THEIR dashboard
  // =================================================================
  if (pathname === "/" && isValidToken) {
    return NextResponse.redirect(
      new URL(getCorrectDashboard(role), request.url),
    );
  }

  // Let all other requests pass through normally
  return NextResponse.next();
}

// Excellent matcher configuration!
// It specifically skips `/api`, which means it won't block our new OAuth routes.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};