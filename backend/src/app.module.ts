import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'lib/prisma/prisma.module';
import { EmailModule } from 'lib/emails/email.module';
import { ConfigModule } from '@nestjs/config';
import { DriveTestController } from 'drive.controller';
import { DriveTestService } from 'drive.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    PrismaModule,
  ],
  controllers: [AppController, DriveTestController],
  providers: [AppService, DriveTestService],
})
export class AppModule {}
