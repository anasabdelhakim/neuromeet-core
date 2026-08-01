import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { LiveKitBotService } from './livekit-bot.service';
import { WorkerPoolService } from './worker-pool.service';
import { PrismaModule } from '../database/database.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [LivekitController],
  providers: [LivekitService, LiveKitBotService, WorkerPoolService],
  exports: [LiveKitBotService, WorkerPoolService],
})
export class LivekitModule {}


