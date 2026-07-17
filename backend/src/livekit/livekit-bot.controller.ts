import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LiveKitBotService } from './livekit-bot.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { Roles } from 'src/user/decorators/user.decorators';

@Controller('meetings')
@UseGuards(AuthGuard)
export class LiveKitBotController {
  constructor(private readonly botService: LiveKitBotService) {}
  
  @Post('start')
  @Roles(['INSTRUCTOR'])
  async startMeeting(@Body() body: { roomId: string }) {
    await this.botService.dispatchBotToRoom(body.roomId);
    return { status: 'started', roomId: body.roomId };
  }
  
  @Post('end')
  @Roles(['INSTRUCTOR'])
  async endMeeting(@Body() body: { roomId: string }) {
    await this.botService.recallBotFromRoom(body.roomId);
    return { status: 'ended', roomId: body.roomId };
  }
}
