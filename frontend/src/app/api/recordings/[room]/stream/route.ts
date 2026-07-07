import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/src/lib/api-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const url = new URL(req.url);
    const duration = url.searchParams.get("duration") || "0";

    const backendRes = await fetch(`${BASE_URL}/drive/recording/stream/${resolvedParams.room}?duration=${duration}`, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'video/webm',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
      body: req.body,
      duplex: 'half'
    } as RequestInit);

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error("Stream Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
