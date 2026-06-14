import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaModule } from 'src/database/database.module';
import { JwtConfigModule } from 'src/auth/jwt.config';
import { CacheModule } from 'src/utils/cache.module';

@Module({
  imports: [PrismaModule, JwtConfigModule, CacheModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}

