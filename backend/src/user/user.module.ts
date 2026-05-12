import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController, UserMeController } from './user.controller';
import { PrismaModule } from '../database/database.module';
import { JwtConfigModule } from '../auth/jwt.config';

@Module({
  imports:[PrismaModule , JwtConfigModule],
  controllers: [UserController,UserMeController],
  providers: [UserService],
})
export class UserModule {};

