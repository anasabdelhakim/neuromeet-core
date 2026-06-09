import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// دالة فك التوكن بشكل سريع وآمن على الـ Edge بدون مكتبات خارجية
function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;

  // فك التوكن لمعرفة الـ Role والـ Expiration
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const role = payload?.role; 
  
  // التوكن يعتبر صالحاً إذا تم فكه ولم تنتهِ صلاحيته بعد
  const isAccessValid = !!payload && payload.exp ? payload.exp * 1000 > Date.now() : false;
  
  // اليوزر يعتبر متصل (Authenticated) إذا كان معاه أكسس توكن شغال، أو لسه معاه ريفريش توكن نقدر نعتمد عليه
  const isAuthenticated = isAccessValid || !!refreshToken;

  // ---------- تصنيف المسارات ----------
  const authRoutes = ["/sign-in", "/sign-up", "/forget-password", "/verify-email", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isInstructorRoute = pathname.startsWith("/dashboard-instructor");
  const isStudentRoute = pathname.startsWith("/dashboard-student");
  const isProtectedRoute = isInstructorRoute || isStudentRoute;

  const getCorrectDashboard = (userRole?: string) => {
    if (userRole === "INSTRUCTOR") return "/dashboard-instructor";
    if (userRole === "STUDENT") return "/dashboard-student";
    return "/sign-in";
  };

  // 1. لو اليوزر متصل وبيحاول يروح لصفحات الـ Auth (زي Sign In) رجعه على الداشبورد بتاعته
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }

  // 2. لو اليوزر مش متصل تماماً (معندوش لا أكسس ولا ريفريش) وبيحاول يدخل صفحات محمية
  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    // تنظيف أي كوكيز تالفة متبقية
    if (request.cookies.has("access_token")) response.cookies.delete("access_token");
    if (request.cookies.has("refresh_token")) response.cookies.delete("refresh_token");
    return response;
  }

  // 3. الحماية الصارمة للأدوار (RBAC) - فقط لو الأكسس توكن لسه شغال ومعاه Role مختلف
  if (isAccessValid) {
    if (isInstructorRoute && role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
    }
    if (isStudentRoute && role !== "STUDENT") {
      return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
    }
  }

  // 4. توجيه الـ Root "/" للداشبورد الصحيحة لو مسجل دخول
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL(getCorrectDashboard(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};