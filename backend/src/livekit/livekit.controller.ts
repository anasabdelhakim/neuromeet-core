import { Controller, Get, Query, Delete, Body } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { LiveKitBotService } from './livekit-bot.service';

@Controller('livekit')
export class LivekitController {
  constructor(
    private readonly livekitService: LivekitService,
    private readonly liveKitBotService: LiveKitBotService
  ) {}

  @Get('token')
  async getToken(
    @Query('room') room: string, 
    @Query('user') user: string,
    @Query('role') role: string = 'STUDENT'
  ) {
    console.log(`\n\n[🔥 LIVEKIT CONTROLLER] Token requested for room: ${room} by ${user} (Role: ${role})`);

    // Only dispatch the AI bot if the instructor is starting the meeting
    if (role === 'INSTRUCTOR') {
      console.log(`[🔥 LIVEKIT CONTROLLER] Dispatching AI Bot for Instructor...\n\n`);
      this.liveKitBotService.dispatchBotToRoom(room).catch(err => {
        console.warn('Failed to dispatch bot:', err);
      });
    }

    // Return the token with metadata
    return {
      token: await this.livekitService.createToken(room, user, role),
    };
  }

  @Delete('participant')
  async kickParticipant(
    @Body('room') room: string,
    @Body('identity') identity: string,
  ) {
    console.log(`[🔥 LIVEKIT CONTROLLER] Kicking user ${identity} from room ${room}`);
    return this.livekitService.removeParticipant(room, identity);
  }
}
