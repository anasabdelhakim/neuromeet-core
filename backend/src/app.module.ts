import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';
import { DriveController } from './Drive/drive.controller';
import { DriveService } from './Drive/drive.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { OAuthModule } from 'src/oauth/oauth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from 'src/emails/email.module';
import { MeetingsModule } from './meetings/meetings.module';
import { UserModule } from './user/user.module';
import { CacheModule } from './utils/cache.module';
import { AdminModule } from './admin/admin.module';
import { GroupsModule } from './groups/groups.module';
import { RecordingsModule } from './recordings/recordings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    LivekitModule,
    EmailModule,
    AuthModule,
    OAuthModule,
    MeetingsModule,
    GroupsModule,
    UserModule,
    CacheModule,
    AdminModule,
    RecordingsModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController, DriveController],
  providers: [
    AppService,
    DriveService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
