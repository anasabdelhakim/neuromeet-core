import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../lib/prisma/_generated';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
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
}
