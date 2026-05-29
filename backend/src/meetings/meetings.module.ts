import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/database/database.module';
import { JwtConfigModule } from 'src/auth/jwt.config';

@Module({
  imports: [PrismaModule, JwtConfigModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
