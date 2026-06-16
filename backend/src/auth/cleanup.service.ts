import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AUTH_CONSTANTS } from './auth.constants';
import { PrismaService } from 'src/database/database.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupUnverifiedUsers() {
    const cutoff = new Date(
      Date.now() - AUTH_CONSTANTS.UNVERIFIED_USER_MAX_AGE_MS,
    );

    try {
      const result = await this.prisma.user.deleteMany({
        where: {
          verificationCode: { not: null },
          // SECURITY FIX: Only delete users stuck in the SIGN_UP phase.
          // This protects older users who are currently doing a password reset!
          otpPurpose: 'SIGN_UP', 
          created_at: { lt: cutoff },
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Deleted ${result.count} unverified user(s) older than 24 hours.`,
        );
      }
    } catch (error) {
      // Always wrap cron jobs in try/catch so database hiccups don't 
      // crash the background worker thread.
      this.logger.error('Failed to run unverified user cleanup', error.message);
    }
  }
} 