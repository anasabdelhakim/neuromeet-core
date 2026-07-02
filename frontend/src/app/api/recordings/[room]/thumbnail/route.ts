import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/src/lib/api-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const body = await req.json();

    const backendRes = await fetch(`${BASE_URL}/recordings/${resolvedParams.room}/thumbnail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify(body)
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error("Thumbnail Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
