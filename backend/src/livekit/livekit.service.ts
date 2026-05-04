import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  async createToken(room: string, user: string) {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: user,
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
}
