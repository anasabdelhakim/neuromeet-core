import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/src/lib/api-client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
      duplex: 'half'
    } as RequestInit);

    const data = await backendRes.json().catch(() => ({}));

    if (url.searchParams.get("isFinal") === "true") {
      revalidatePath("/dashboard-instructor/recordings");
      revalidatePath("/dashboard-instructor");
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error("Chunk Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
