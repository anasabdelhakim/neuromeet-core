import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  private generateRoomCode(): string {
    return randomBytes(5).toString('hex').toLowerCase(); // 10 chars
  }

  // =========================
  // CREATE / SCHEDULE
  // =========================

  async createInstantMeeting(instructorId: string, dto: CreateMeetingDto) {
    let roomCode = this.generateRoomCode();
    let collision = true;
    while (collision) {
      const existing = await this.prisma.meeting.findUnique({ where: { roomCode } });
      if (existing) roomCode = this.generateRoomCode();
      else collision = false;
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title || 'Instant Meeting',
        description: dto.description,
        scheduledAt: new Date(),
        duration: dto.duration || 60,
        status: 'LIVE',
        isInstant: true,
        isGroupLocked: dto.isGroupLocked ?? false,
        roomCode,
        instructorId,
        groupId: dto.groupId,
      },
    });

    return { status: 'success', data: meeting };
  }

  async scheduleMeeting(instructorId: string, dto: CreateMeetingDto) {
    if (!dto.scheduledAt) {
      throw new BadRequestException('scheduledAt is required for scheduled meetings.');
    }

    let roomCode = this.generateRoomCode();
    let collision = true;
    while (collision) {
      const existing = await this.prisma.meeting.findUnique({ where: { roomCode } });
      if (existing) roomCode = this.generateRoomCode();
      else collision = false;
    }

    const scheduledDate = new Date(dto.scheduledAt);
    
    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title,
        description: dto.description,
        scheduledAt: scheduledDate,
        timezone: dto.timezone || 'UTC',
        duration: dto.duration || 60,
        status: 'SCHEDULED',
        isInstant: false,
        isGroupLocked: dto.isGroupLocked ?? false,
        roomCode,
        instructorId,
        groupId: dto.groupId,
      },
    });

    // TODO: Enqueue BullMQ `notification-delay` job to fire 30 min before `scheduledDate`
    // Example: await this.notificationQueue.add('send-reminder', { meetingId: meeting.id }, { delay: scheduledDate.getTime() - Date.now() - 30 * 60 * 1000 });

    return { status: 'success', data: meeting };
  }

  // =========================
  // GET MEETINGS (INSTRUCTOR)
  // =========================

  async getUpcomingMeetings(instructorId: string, cursor?: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        instructorId,
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { scheduledAt: 'asc' },
      include: { group: { select: { name: true } } },
    });

    return { status: 'success', data: meetings, nextCursor: meetings.length === 20 ? meetings[19].id : null };
  }

  async getPreviousMeetings(instructorId: string, cursor?: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        instructorId,
        status: { in: ['ENDED', 'CANCELLED'] },
      },
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { scheduledAt: 'desc' },
      include: { group: { select: { name: true } } },
    });

    return { status: 'success', data: meetings, nextCursor: meetings.length === 20 ? meetings[19].id : null };
  }

  async getTodayMeetings(instructorId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const meetings = await this.prisma.meeting.findMany({
      where: {
        instructorId,
        scheduledAt: { gte: startOfToday, lte: endOfToday },
        status: { not: 'CANCELLED' },
      },
      orderBy: { scheduledAt: 'asc' },
      include: { group: { select: { name: true } } },
    });

    return { status: 'success', data: meetings };
  }

  // =========================
  // EDIT & CANCEL
  // =========================

  async updateMeeting(id: string, instructorId: string, dto: UpdateMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found.');
    if (meeting.instructorId !== instructorId) throw new ForbiddenException('Only the instructor can edit this meeting.');
    if (meeting.status !== 'SCHEDULED') throw new BadRequestException('Only SCHEDULED meetings can be edited.');

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        timezone: dto.timezone,
        duration: dto.duration,
      },
    });

    return { status: 'success', data: updated };
  }

  async cancelMeeting(id: string, instructorId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found.');
    if (meeting.instructorId !== instructorId) throw new ForbiddenException('Only the instructor can cancel this meeting.');

    // TODO: Cancel delayed notification job in BullMQ

    const cancelled = await this.prisma.meeting.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return { status: 'success', message: 'Meeting cancelled.', data: cancelled };
  }

  // =========================
  // JOIN & STUDENT QUERIES
  // =========================

  async joinMeetingByCode(code: string, userId: string, role: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { roomCode: code },
      include: { group: true },
    });

    if (!meeting) throw new NotFoundException('Invalid meeting code.');
    if (meeting.status === 'CANCELLED' || meeting.status === 'ENDED') {
      throw new BadRequestException('This meeting is no longer active.');
    }

    if (meeting.isGroupLocked && meeting.groupId && role === 'STUDENT') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_groupId: { studentId: userId, groupId: meeting.groupId } },
      });
      if (!enrollment) {
        throw new ForbiddenException('You must be a member of the group to join this meeting.');
      }
    }

    // Usually, here you'd generate a LiveKit token and return it.
    // For now, we return success so the frontend knows the code is valid.
    return { status: 'success', data: { meetingId: meeting.id, title: meeting.title } };
  }

  async getStudentUpcomingMeetings(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { groupId: true },
    });
    const groupIds = enrollments.map(e => e.groupId);

    const meetings = await this.prisma.meeting.findMany({
      where: {
        groupId: { in: groupIds },
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      orderBy: { scheduledAt: 'asc' },
      include: { instructor: { select: { name: true, avatarUrl: true } }, group: { select: { name: true } } },
    });

    return { status: 'success', data: meetings };
  }

  async getStudentTodayMeetings(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { groupId: true },
    });
    const groupIds = enrollments.map(e => e.groupId);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const meetings = await this.prisma.meeting.findMany({
      where: {
        groupId: { in: groupIds },
        scheduledAt: { gte: startOfToday, lte: endOfToday },
        status: { not: 'CANCELLED' },
      },
      orderBy: { scheduledAt: 'asc' },
      include: { instructor: { select: { name: true, avatarUrl: true } }, group: { select: { name: true } } },
    });

    return { status: 'success', data: meetings };
  }
}
