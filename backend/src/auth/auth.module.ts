import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../database/database.module';
import { EmailModule } from '../../lib/emails/email.module';
import { JwtConfigModule } from './jwt.config';

@Module({
  imports: [PrismaModule , JwtConfigModule , EmailModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaModule],
  exports: [AuthService],
})
export class AuthModule {}