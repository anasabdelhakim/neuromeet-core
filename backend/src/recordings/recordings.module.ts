import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { PrismaModule } from '../database/database.module';
import { JwtConfigModule } from '../auth/jwt.config';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [PrismaModule, JwtConfigModule, NotificationsModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}
