import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMeController } from './user.controller';
import { PrismaModule } from 'src/database/database.module';
@Module({
  imports: [PrismaModule],
  controllers: [UserMeController],
  providers: [UserService],
})
export class UserModule {}
