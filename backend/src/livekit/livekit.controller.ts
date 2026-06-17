import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { LiveKitBotService } from './livekit-bot.service';

@Controller('livekit')
export class LivekitController {
  constructor(
    private readonly livekitService: LivekitService,
    private readonly liveKitBotService: LiveKitBotService
  ) {}

  @Get('token')
  async getToken(@Query('room') room: string, @Query('user') user: string) {
    console.log(`\n\n[🔥 LIVEKIT CONTROLLER] Someone requested a token for room: ${room}`);
    console.log(`[🔥 LIVEKIT CONTROLLER] Dispatching AI Bot now...\n\n`);

    // 1. Dispatch the AI bot to the room in the background!
    // We don't await this so it doesn't block the user from getting their token
    this.liveKitBotService.dispatchBotToRoom(room).catch(err => {
      console.warn('Failed to dispatch bot:', err);
    });

    // 2. Return the token for the user
    return {
      token: await this.livekitService.createToken(room, user),
    };
  }
}
