import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';
import { EmailModule } from 'lib/emails/email.module';
// import { DriveTestController } from './Drive/drive.controller';
// import { DriveTestService } from './Drive/drive.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { OAuthModule } from 'src/oauth/oauth.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
     ThrottlerModule.forRoot([
  {
    ttl: 60,
    limit: 10,
  },
]),
    PrismaModule,
    LivekitModule,
    EmailModule,
      AuthModule,
      OAuthModule,
      UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
