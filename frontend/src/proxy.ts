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

  // ---------- TOKEN REFRESH LOGIC ----------
  // If the access token is expired, but we still have a refresh token, we MUST
  // intercept the request right now in the middleware, get new tokens from the
  // NestJS backend, and attach them to the current request and response cookies.
  // This prevents `getUserProfile` from crashing and showing the "default user".
  if (!isAccessValid && refreshToken) {
    try {
      const baseUrl = process.env.NESTJS_URL || 'http://localhost:4000/api/v1';
      const refreshRes = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        refreshToken = data.refresh_token || refreshToken;
        
        // Update variables for routing
        payload = decodeJwtPayload(accessToken!);
        role = payload?.role;
        isAccessValid = true;

        // Save new cookies to the browser
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
        
        // Critically: Update the cookies on the incoming request. 
        // Without this, Server Components (like your Navbar/Profile) running on 
        // THIS page load won't see the new tokens and will fail!
        request.cookies.set('access_token', accessToken!);
        request.cookies.set('refresh_token', refreshToken!);
      } else {
        // Refresh token is invalid/expired. Wipe out the cookies to force re-login.
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

  // A user is only considered authenticated if their access token is valid 
  // (or successfully refreshed above)
  const isAuthenticated = isAccessValid;

  // ---------- ROUTE CLASSIFICATION ----------
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

  // 1. Authenticated users on Auth pages -> Dashboard (or Meeting Room if quick-join redirect cookie exists)
  if (isAuthRoute && isAuthenticated && role) {
    const meetingRedirect = request.cookies.get("meeting_redirect_url")?.value;
    const targetUrl = meetingRedirect || getCorrectDashboard(role);

    if (targetUrl) {
      // Create a redirect response, but we MUST copy over the refreshed cookies 
      // if they were updated above!
      const redirectRes = NextResponse.redirect(new URL(targetUrl, request.url));
      
      if (meetingRedirect) {
        // Clear the cookie so we don't redirect repeatedly
        redirectRes.cookies.delete("meeting_redirect_url");
      }

      if (response.cookies.has('access_token')) {
        redirectRes.cookies.set('access_token', response.cookies.get('access_token')!.value, response.cookies.get('access_token')!);
        redirectRes.cookies.set('refresh_token', response.cookies.get('refresh_token')!.value, response.cookies.get('refresh_token')!);
      }
      return redirectRes;
    }
  }

  // 2. Unauthenticated users on Protected pages -> Sign-in
  if (isProtectedRoute && !isAuthenticated) {
    const redirectRes = NextResponse.redirect(new URL("/sign-in", request.url));
    redirectRes.cookies.delete("access_token");
    redirectRes.cookies.delete("refresh_token");
    return redirectRes;
  }

  // 2b. Unauthenticated users on Join Meeting pages -> Sign-in + Set meeting_redirect_url cookie
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

  // 2c. Authenticated users with a pending meeting redirect trying to access dashboards/protected pages -> Direct to meeting
  if (isAuthenticated && role && isProtectedRoute) {
    const meetingRedirect = request.cookies.get("meeting_redirect_url")?.value;
    if (meetingRedirect) {
      const redirectRes = NextResponse.redirect(new URL(meetingRedirect, request.url));
      redirectRes.cookies.delete("meeting_redirect_url");
      return redirectRes;
    }
  }

  // 3. Strict Role-Based Access Control (RBAC)
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