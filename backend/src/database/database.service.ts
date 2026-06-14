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
      min: 5,                       // Keep 5 idle connections warm
      max: 20,                      // Cap at 20 (safe for 4 backend replicas × 20 = 80 < PG max 100)
      idleTimeoutMillis: 30_000,    // Reclaim idle connections after 30s
      connectionTimeoutMillis: 5_000, // Fail fast if PG is unreachable
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }

  // ⚡ Keep-Alive Ping for Neon Scale-to-Zero
  // Runs every 4 minutes to prevent the database from sleeping
  @Cron('0 */4 * * * *')
  async keepAlivePing() {
    try {
      await this.$queryRaw`SELECT 1`;
      this.logger.debug('Neon Keep-Alive Ping successful ⚡');
    } catch (error) {
      this.logger.error('Neon Keep-Alive Ping failed ❌', error);
    }
  }
}
