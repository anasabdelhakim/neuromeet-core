import { Injectable } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  async createToken(room: string, user: string, role: string = 'STUDENT') {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: user,
        metadata: JSON.stringify({ role }),
      },
    );

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    return await at.toJwt();
  }

  async removeParticipant(room: string, identity: string) {
    const svc = new RoomServiceClient(
      process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || '',
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
    await svc.removeParticipant(room, identity);
    return { success: true };
  }
}
