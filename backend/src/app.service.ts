import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/database.service';
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }
  async testDatabaseConnection() {
    try {
      const usersCount = await this.prisma.user.count();
      return {
        status: 'success',
        message: 'Prisma is connected successfully! 🚀',
        usersCount: usersCount,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to connect to the database 😢',
        error: error.message,
      };
    }
  }
}
