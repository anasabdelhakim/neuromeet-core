import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PrismaModule } from '../database/database.module';

/**
 * PRACTICE MODULE
 * ───────────────
 * This module is your sandbox. Everything here is isolated from the
 * real app but runs on the REAL database, real Prisma, real Bun runtime.
 *
 * HOW TO ADD A NEW PRACTICE:
 * 1. Add your route in practice.controller.ts
 * 2. Add your logic in practice.service.ts
 * 3. Hit the endpoint at: GET/POST http://localhost:4000/api/v1/practice/...
 *
 * No need to touch app.module.ts — it already imports this module.
 */
@Module({
  imports: [
    PrismaModule, // gives you access to PrismaService (real DB)
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
