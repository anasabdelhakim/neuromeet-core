import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: Decode the JWT payload at the Edge.
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
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

  // ---------- Decode Role ----------
  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role; // 'INSTRUCTOR' | 'STUDENT' | undefined

  // Helper function to dynamically route based on role
  const getCorrectDashboard = (userRole?: string) => {
    if (userRole === "INSTRUCTOR") return "/dashboard-instructor";
    if (userRole === "STUDENT") return "/dashboard-student";
    return "/sign-in"; // Fallback: If they have a weird/missing role, force them to log in again
  };

  // =================================================================
  // RULE 1: Logged-in users visiting auth pages → redirect to THEIR dashboard
  // =================================================================
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }

  // =================================================================
  // RULE 2: Unauthenticated users visiting ANY protected page → sign in
  // =================================================================
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // =================================================================
  // RULE 3: Strict Role-Based Access Control (The Bouncer)
  // Prevent Students from entering Instructor routes, and vice versa.
  // =================================================================
  if (isInstructorRoute && role !== "INSTRUCTOR") {
    // They are trying to sneak into the instructor area. Send them to their actual home.
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }
  
  if (isStudentRoute && role !== "STUDENT") {
    // They are trying to sneak into the student area. Send them to their actual home.
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }

  // =================================================================
  // RULE 4: Root path "/" — redirect logged-in users to THEIR dashboard
  // =================================================================
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }

  // Let all other requests (like public marketing pages) pass through normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};