import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from 'livekit-server-sdk';

/**
 * LiveKitBotService
 *
 * NestJS orchestration layer for the Python livekit-agents AI bot.
 *
 * Architecture (DO NOT CHANGE):
 *  ┌────────────────────────────────────────────────────────────────────┐
 *  │ 1. generateBotToken()  → signs a hidden-participant JWT            │
 *  │ 2. dispatchBotToRoom() → POSTs token to the Python Worker HTTP API │
 *  │    Python bot joins room via WebRTC, subscribes to tracks directly │
 *  │    and publishes scores via room.local_participant.publish_data()  │
 *  │ 3. Frontend receives scores via RoomEvent.DataReceived             │
 *  │    (useEngagementData.ts) — zero NestJS round-trip after dispatch  │
 *  └────────────────────────────────────────────────────────────────────┘
 *
 * NestJS NEVER processes or proxies video blobs. EngagementGateway and
 * AiInferenceService (Option A) are explicitly abandoned.
 */
@Injectable()
export class LiveKitBotService {
  private readonly logger = new Logger(LiveKitBotService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  // ─── Token Generation ────────────────────────────────────────────────────────

  /**
   * Generate a hidden-participant JWT for the AI bot.
   * Synchronous — livekit-server-sdk v2 toJwt() is sync on current backend.
   *
   * Grant breakdown:
   *  canSubscribe:   true  ← reads participant video/audio via WebRTC
   *  canPublishData: true  ← publishes engagement scores over Data Channel
   *  canPublish:     false ← no camera/mic (truly hidden)
   *  hidden:         true  ← invisible in the participant list
   */
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
      canSubscribe: true,      // Must subscribe to student tracks
      canPublishData: true,    // Must publish engagement scores
      canPublish: false,       // Bot doesn't publish audio/video
      hidden: true,            // Invisible in participant list
    });

    // In livekit-server-sdk v2, toJwt() is async and returns a Promise<string>
    return await at.toJwt();
  }

  // ─── Bot Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Tell the Python AI Worker to dispatch a bot to this room.
   * Called when a meeting transitions to LIVE status.
   */
  async dispatchBotToRoom(roomId: string): Promise<void> {
    const botToken = await this.generateBotToken(roomId);
    const workerUrl = this.config.get<string>('AI_WORKER_URL', 'http://ai-worker:8080');

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
      this.logger.error(`Failed to dispatch bot to room ${roomId}`, err);
      throw err;
    }
  }

  /**
   * Signal the Python Worker to recall the bot.
   * Called when the meeting ends so the bot exits cleanly.
   */
  async recallBotFromRoom(roomId: string): Promise<void> {
    const workerUrl = this.config.get<string>('AI_WORKER_URL', 'http://ai-worker:8080');

    await firstValueFrom(
      this.http.post(`${workerUrl}/api/recall`, { room_name: roomId }),
    ).catch((e) =>
      this.logger.warn(`Recall failed for room ${roomId}: ${e.message}`),
    );
  }
}
