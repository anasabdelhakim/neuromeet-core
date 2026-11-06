import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';

/**
 * PRACTICE SERVICE
 * ─────────────────
 * This is where your business logic lives.
 * The controller calls methods here. This service has access to:
 *
 *   this.prisma  → real database (PostgreSQL via Prisma)
 *
 * PRISMA QUICK REFERENCE:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  Find one:    this.prisma.user.findUnique({ where: {...} })  │
 * │  Find many:   this.prisma.user.findMany({ where: {...} })    │
 * │  Create:      this.prisma.user.create({ data: {...} })       │
 * │  Update:      this.prisma.user.update({ where, data })       │
 * │  Delete:      this.prisma.user.delete({ where: {...} })      │
 * │  Count:       this.prisma.user.count({ where: {...} })       │
 * └──────────────────────────────────────────────────────────────┘
 *
 * All models available: user, meeting, group, enrollment,
 * session, recording, notification, meetingParticipant, etc.
 * See prisma/schema.prisma for the full list.
 */
@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  // ─── Example: Fetch a user from the real DB by ID ────────────────────────
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        // never select: password, verificationCode, etc.
      },
    });

    if (!user) {
      // NestJS automatically turns this into a 404 HTTP response
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return { status: 'success', data: user };
  }

  // ─── Example: Count all meetings in the DB ───────────────────────────────
  async getMeetingStats() {
    const [total, live, scheduled] = await Promise.all([
      this.prisma.meeting.count(),
      this.prisma.meeting.count({ where: { status: 'LIVE' } }),
      this.prisma.meeting.count({ where: { status: 'SCHEDULED' } }),
    ]);

    return { total, live, scheduled };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADD YOUR OWN PRACTICE METHODS BELOW THIS LINE
  // ─────────────────────────────────────────────────────────────────────────
}
