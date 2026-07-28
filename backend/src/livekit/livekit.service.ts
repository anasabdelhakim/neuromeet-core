import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaService } from '../database/database.service';

@Injectable()
export class LivekitService {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(room: string, user: string, role: string = 'STUDENT') {
    // Wait, let's verify the meeting exists and is active
    const meeting = await this.prisma.meeting.findFirst({
      where: { livekitRoomName: room },
    });

    if (!meeting) {
      throw new UnauthorizedException('Meeting not found');
    }

    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      throw new UnauthorizedException('This meeting is no longer active');
    }


    if (meeting.status === 'SCHEDULED' && role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      throw new BadRequestException('The host has not started this meeting yet.');
    }

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
      process.env.LIVEKIT_API_SECRET,
    );
    await svc.removeParticipant(room, identity);
    return { success: true };
  }
}
