import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../lib/prisma/_generated';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 30_000, // Increased to 30s to allow Neon to wake up
    });

    // 🚨 Prevent Node.js from crashing when an idle connection drops
    pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }

  // ⚡ Keep-Alive Ping for Neon Scale-to-Zero
  // We are re-enabling this to prevent P1001 connection errors!
  @Cron('*/4 * * * *')
  async keepAlivePing() {
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.debug('Keep-alive ping sent to Neon DB');
    } catch (error: any) {
      this.logger.error('Keep-alive ping failed', error.message);
    }
  }
}
