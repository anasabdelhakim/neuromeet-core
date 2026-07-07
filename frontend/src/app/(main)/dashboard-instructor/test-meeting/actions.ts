'use server';
import { redirect } from 'next/navigation';
import { apiPost } from '@/src/lib/api-client';
import { getAuthCookies } from '@/src/lib/auth-cookies';
import { parseJwt } from '@/src/features/livekit/helpers/auth';
export async function launchTestMeetingAction() {
  let meetingId: string;
  let userName = 'Instructor';
  try {
    const { accessToken } = await getAuthCookies();
    if (accessToken) {
      const payload = parseJwt(accessToken);
      userName = payload?.name || payload?.email || 'Instructor';
    }
    const meetingRes = await apiPost<{
      status: string;
      data: { id: string; title: string };
    }>('/meetings', {
      title: 'Instant Test Session',
      platform: 'NEUROMEET',
      description: 'A live-session test room with active WebRTC disengagement monitoring.',
    });
    meetingId = meetingRes.data.id;
    await apiPost('/meetings/start', {
      roomId: meetingId,
    });
  } catch (error) {
    console.error('[launchTestMeetingAction] Failed to initialize test session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during initialization',
    };
  }
  redirect(`/livekit?room=${meetingId}&user=${encodeURIComponent(userName)}`);
}
