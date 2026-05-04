import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from 'lib/emails/email.module';
import { ConfigModule } from '@nestjs/config';
import { DriveTestController } from './Drive/drive.controller';
import { DriveTestService } from 'src/Drive/drive.service';
import { PrismaModule } from './database/database.module';
import { LivekitModule } from './livekit/livekit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    PrismaModule,
    LivekitModule,
  ],
  controllers: [AppController, DriveTestController],
  providers: [AppService, DriveTestService],
})
export class AppModule {}
