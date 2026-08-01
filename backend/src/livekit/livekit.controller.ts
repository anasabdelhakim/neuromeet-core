import { Controller, Get, Query, Delete, Body } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { LiveKitBotService } from './livekit-bot.service';
@Controller('livekit')
export class LivekitController {
  constructor(
    private readonly livekitService: LivekitService,
    private readonly liveKitBotService: LiveKitBotService,
  ) {}
  @Get('token')
  async getToken(
    @Query('room') room: string,
    @Query('user') user: string,
    @Query('role') role: string = 'STUDENT',
  ) {
    return {
      token: await this.livekitService.createToken(room, user, role),
    };
  }
  @Delete('participant')
  async kickParticipant(
    @Body('room') room: string,
    @Body('identity') identity: string,
  ) {
    return this.livekitService.removeParticipant(room, identity);
  }
}
