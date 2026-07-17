import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/database/database.module';
import { JwtConfigModule } from 'src/config/jwt.config';
import { CacheModule } from 'src/utils/cache.module';
import { LivekitModule } from 'src/livekit/livekit.module';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    PrismaModule,
    JwtConfigModule,
    CacheModule,
    LivekitModule,
    NotificationsModule,
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
