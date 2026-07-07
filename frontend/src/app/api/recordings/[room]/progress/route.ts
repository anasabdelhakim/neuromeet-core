import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/src/lib/api-client";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const backendRes = await fetch(`${BASE_URL}/drive/recording/progress/${resolvedParams.room}`, {
      headers: {
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      }
    });

    return new NextResponse(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error: any) {
    console.error("SSE Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
