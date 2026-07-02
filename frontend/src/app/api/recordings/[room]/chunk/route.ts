import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/src/lib/api-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    const url = new URL(req.url);
    const queryString = url.search; // passes all query params (uploadUrl, byteOffset, etc)
    
    const backendRes = await fetch(`${BASE_URL}/drive/recording/chunk/${resolvedParams.room}${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'application/octet-stream',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
      body: req.body,
      // @ts-ignore - Required for passing a ReadableStream in fetch
      duplex: 'half'
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error("Chunk Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
