import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';
// import { DriveController } from './Drive/drive.controller';
// import { DriveService } from './Drive/drive.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { OAuthModule } from 'src/oauth/oauth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from 'src/emails/email.module';
import { RedisModule } from '@nestjs-modules/ioredis';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    LivekitModule,
    EmailModule,
    AuthModule,
    OAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
