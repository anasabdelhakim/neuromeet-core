import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { LiveKitBotService } from './livekit-bot.service';
import { LiveKitBotController } from './livekit-bot.controller';
import { WorkerPoolService } from './worker-pool.service';

@Module({
  imports: [
    // Required for LiveKitBotService → dispatchBotToRoom / recallBotFromRoom
    HttpModule,
  ],
  controllers: [LivekitController, LiveKitBotController],
  providers: [LivekitService, LiveKitBotService, WorkerPoolService],
  // Export so MeetingsModule can inject LiveKitBotService when a meeting
  // transitions to LIVE status, and WorkerPoolService for load balancing.
  exports: [LiveKitBotService, WorkerPoolService],
})
export class LivekitModule {}