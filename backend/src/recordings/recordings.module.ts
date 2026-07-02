import { Module } from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { PrismaModule } from '../database/database.module';
import { JwtConfigModule } from '../auth/jwt.config';

@Module({
  imports: [PrismaModule, JwtConfigModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}
