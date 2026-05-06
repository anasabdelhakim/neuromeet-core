import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';
import { EmailModule } from 'lib/emails/email.module';
import { DriveTestController } from './Drive/drive.controller';
import { DriveTestService } from './Drive/drive.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LivekitModule,
    EmailModule,
  ],
  controllers: [AppController, DriveTestController],
  providers: [AppService, DriveTestService],
})
export class AppModule {}
