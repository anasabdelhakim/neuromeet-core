import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';
import { DriveController } from './Drive/drive.controller';
import { DriveService } from './Drive/drive.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { OAuthModule } from 'src/oauth/oauth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from 'src/emails/email.module';

import { MeetingsModule } from './meetings/meetings.module';
import { UserModule } from './user/user.module';
import { CacheModule } from './utils/cache.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    // RedisModule temporarily disabled to use lightning-fast in-memory cache
    ScheduleModule.forRoot(),
    PrismaModule,
    LivekitModule,
    EmailModule,
    AuthModule,
    OAuthModule,
    MeetingsModule,
    UserModule,
    CacheModule,
  ],
  controllers: [AppController, DriveController],
  providers: [AppService, DriveService],
})
export class AppModule {}
