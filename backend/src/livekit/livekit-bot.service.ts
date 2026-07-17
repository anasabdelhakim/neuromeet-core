import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveKitBotService {
  private readonly logger = new Logger(LiveKitBotService.name);
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}
  
  async generateBotToken(roomId: string): Promise<string> {
    const at = new AccessToken(
      this.config.get<string>('LIVEKIT_API_KEY'),
      this.config.get<string>('LIVEKIT_API_SECRET'),
      {
        identity: `ai-bot-${roomId}`,
        name: 'EngagementBot',
        ttl: '6h',
      },
    );
    at.addGrant({
      roomJoin: true,
      room: roomId,
      canSubscribe: true, // Must subscribe to student tracks
      canPublishData: true, // Must publish engagement scores
      canPublish: false, // Bot doesn't publish audio/video
      hidden: true, // Invisible in participant list
    });
    return await at.toJwt();
  }
  
  async dispatchBotToRoom(roomId: string): Promise<void> {
    const botToken = await this.generateBotToken(roomId);
    const workerUrl = this.config.get<string>(
      'AI_WORKER_URL',
      'http://127.0.0.1:8080',
    );
    try {
      await firstValueFrom(
        this.http.post(`${workerUrl}/api/dispatch`, {
          room_name: roomId,
          token: botToken,
          metadata: { purpose: 'engagement_analysis' },
        }),
      );
      this.logger.log(`Bot dispatched to room: ${roomId}`);
    } catch (err) {
      this.logger.warn(
        `⚠️ AI Worker is offline or unreachable (${workerUrl}). Meeting will start WITHOUT the AI bot.`,
      );
    }
  }
  
  async recallBotFromRoom(roomId: string): Promise<void> {
    const workerUrl = this.config.get<string>(
      'AI_WORKER_URL',
      'http://127.0.0.1:8080',
    );
    await firstValueFrom(
      this.http.post(`${workerUrl}/api/recall`, { room_name: roomId }),
    ).catch((e) =>
      this.logger.warn(`Recall failed for room ${roomId}: ${e.message}`),
    );
  }
}
