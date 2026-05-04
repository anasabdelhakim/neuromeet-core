import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../lib/prisma/_generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}
