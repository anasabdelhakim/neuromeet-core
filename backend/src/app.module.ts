import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'lib/prisma/prisma.module';
import { EmailModule } from 'lib/emails/email.module';

@Module({
  imports: [EmailModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
