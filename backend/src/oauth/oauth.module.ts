import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { OAuthService } from './oauth.service';
import { PrismaService } from '../database/database.service';
import { JwtConfigModule } from 'src/auth/jwt.config';

@Module({
  imports: [JwtConfigModule],
  controllers: [OAuthController],
  providers: [GoogleStrategy, OAuthService, PrismaService],
})
export class OAuthModule {}
