import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LiveKitBotService } from './livekit-bot.service';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { Roles } from 'src/user/decorators/user.decorators';
/**
 * LiveKitBotController
 *
 * Exposes meeting lifecycle hooks that orchestrate the AI bot.
 * Only instructors (role: INSTRUCTOR) may call these endpoints.
 *
 * POST /meetings/start  → dispatches the Python AI bot to the LiveKit room
 * POST /meetings/end    → recalls the bot and cleans up resources
 *
 * The existing meeting CRUD lives in MeetingsController.
 * This controller only handles the AI-bot lifecycle side-channel.
 */
@Controller('meetings')
@UseGuards(AuthGuard)
export class LiveKitBotController {
  constructor(private readonly botService: LiveKitBotService) {}
  /**
   * Called when the instructor starts the meeting.
   * Dispatches the hidden AI bot to the LiveKit room.
   */
  @Post('start')
  @Roles(['INSTRUCTOR'])
  async startMeeting(@Body() body: { roomId: string }) {
    await this.botService.dispatchBotToRoom(body.roomId);
    return { status: 'started', roomId: body.roomId };
  }
  /**
   * Called when the instructor ends the meeting.
   * Recalls the bot so it exits cleanly and frees GPU resources.
   */
  @Post('end')
  @Roles(['INSTRUCTOR'])
  async endMeeting(@Body() body: { roomId: string }) {
    await this.botService.recallBotFromRoom(body.roomId);
    return { status: 'ended', roomId: body.roomId };
  }
}
