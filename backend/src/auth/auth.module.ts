import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../database/database.module';
import { JwtConfigModule } from './jwt.config';
import { EmailModule } from '../emails/email.module';
@Module({
  imports: [PrismaModule, JwtConfigModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaModule],
  exports: [AuthService],
})
export class AuthModule {}
