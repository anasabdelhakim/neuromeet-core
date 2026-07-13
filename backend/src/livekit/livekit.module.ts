import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { LiveKitBotService } from './livekit-bot.service';
import { LiveKitBotController } from './livekit-bot.controller';
import { WorkerPoolService } from './worker-pool.service';
@Module({
  imports: [HttpModule],
  controllers: [LivekitController, LiveKitBotController],
  providers: [LivekitService, LiveKitBotService, WorkerPoolService],
  exports: [LiveKitBotService, WorkerPoolService],
})
export class LivekitModule {}
