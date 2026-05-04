import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
