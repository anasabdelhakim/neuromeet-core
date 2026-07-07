import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtPayload } from "@/src/lib/jwt";

export default async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get("access_token")?.value;
  let refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;

  let payload = accessToken ? decodeJwtPayload(accessToken) : null;
  let role = payload?.role; 
  let isAccessValid = !!payload && payload.exp ? payload.exp * 1000 > Date.now() : false;

  let response = NextResponse.next();

  if (!isAccessValid && refreshToken) {
    try {
      const baseUrl = process.env.NESTJS_URL || 'http://localhost:4000/api/v1';
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const refreshRes = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        refreshToken = data.refresh_token || refreshToken;

        payload = decodeJwtPayload(accessToken!);
        role = payload?.role;
        isAccessValid = true;

        response.cookies.set('access_token', accessToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60, // 1 hour
        });
        response.cookies.set('refresh_token', refreshToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        request.cookies.set('access_token', accessToken!);
        request.cookies.set('refresh_token', refreshToken!);
      } else {

        accessToken = undefined;
        refreshToken = undefined;
        isAccessValid = false;
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        request.cookies.delete("access_token");
        request.cookies.delete("refresh_token");
      }
    } catch (err) {
      console.error("[Proxy] Token refresh failed:", err);
    }
  }

  const isAuthenticated = isAccessValid;

  const authRoutes = ["/sign-in", "/sign-up", "/forget-password", "/verify-email", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isInstructorRoute = pathname.startsWith("/dashboard-instructor");
  const isStudentRoute = pathname.startsWith("/dashboard-student");
  const isAdminRoute = pathname.startsWith("/dashboard-admin");
  const isSettingProfileRoute = pathname.startsWith("/setting-profile");

  const isProtectedRoute = isInstructorRoute || isStudentRoute || isAdminRoute || isSettingProfileRoute;
  const isJoinRoute = pathname.startsWith("/meeting/join/");

  const getCorrectDashboard = (userRole?: string) => {
    if (userRole === "INSTRUCTOR") return "/dashboard-instructor";
    if (userRole === "STUDENT") return "/dashboard-student";
    if (userRole === "ADMIN") return "/dashboard-admin";
    return null;
  };

  if (isAuthRoute && isAuthenticated && role) {
    const meetingRedirect = request.cookies.get("meeting_redirect_url")?.value;
    const targetUrl = meetingRedirect || getCorrectDashboard(role);

    if (targetUrl) {

      const redirectRes = NextResponse.redirect(new URL(targetUrl, request.url));

      if (meetingRedirect) {

        redirectRes.cookies.delete("meeting_redirect_url");
      }

      if (response.cookies.has('access_token')) {
        redirectRes.cookies.set('access_token', response.cookies.get('access_token')!.value, response.cookies.get('access_token')!);
        redirectRes.cookies.set('refresh_token', response.cookies.get('refresh_token')!.value, response.cookies.get('refresh_token')!);
      }
      return redirectRes;
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const redirectRes = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectRes.cookies.delete("access_token");
    redirectRes.cookies.delete("refresh_token");
    return redirectRes;
  }

  if (isJoinRoute && !isAuthenticated) {
    const redirectRes = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectRes.cookies.set("meeting_redirect_url", pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });
    redirectRes.cookies.delete("access_token");
    redirectRes.cookies.delete("refresh_token");
    return redirectRes;
  }

  if (isAuthenticated && role && isProtectedRoute) {
    const meetingRedirect = request.cookies.get("meeting_redirect_url")?.value;
    if (meetingRedirect) {
      const redirectRes = NextResponse.redirect(new URL(meetingRedirect, request.url));
      redirectRes.cookies.delete("meeting_redirect_url");
      return redirectRes;
    }
  }

  if (isAccessValid && role && isProtectedRoute) {
    const dashboardUrl = getCorrectDashboard(role);

    if (!dashboardUrl) {
      const errorRes = NextResponse.redirect(new URL("/sign-in", request.url));
      errorRes.cookies.delete("access_token");
      errorRes.cookies.delete("refresh_token");
      return errorRes;
    }

    if (isInstructorRoute && role !== "INSTRUCTOR") {
      const r = NextResponse.redirect(new URL(dashboardUrl, request.url));
      if (response.cookies.has('access_token')) {
        r.cookies.set('access_token', response.cookies.get('access_token')!.value, response.cookies.get('access_token')!);
        r.cookies.set('refresh_token', response.cookies.get('refresh_token')!.value, response.cookies.get('refresh_token')!);
      }
      return r;
    }
    if (isStudentRoute && role !== "STUDENT") {
      const r = NextResponse.redirect(new URL(dashboardUrl, request.url));
      if (response.cookies.has('access_token')) {
        r.cookies.set('access_token', response.cookies.get('access_token')!.value, response.cookies.get('access_token')!);
        r.cookies.set('refresh_token', response.cookies.get('refresh_token')!.value, response.cookies.get('refresh_token')!);
      }
      return r;
    }
    if (isAdminRoute && role !== "ADMIN") {
      const r = NextResponse.redirect(new URL(dashboardUrl, request.url));
      if (response.cookies.has('access_token')) {
        r.cookies.set('access_token', response.cookies.get('access_token')!.value, response.cookies.get('access_token')!);
        r.cookies.set('refresh_token', response.cookies.get('refresh_token')!.value, response.cookies.get('refresh_token')!);
      }
      return r;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};