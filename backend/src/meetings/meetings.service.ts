import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { CacheService } from 'src/utils/cache.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  JoinMeetingDto,
  UpdateParticipantDto,
  AddMaterialDto,
} from './dto/meeting.dto';
import { LiveKitBotService } from 'src/livekit/livekit-bot.service';
import { EmailService } from 'src/emails/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotifType } from '../../lib/prisma/_generated';
import * as crypto from 'crypto';
import { RoomServiceClient } from 'livekit-server-sdk';
const CACHE_TTL = {
  MEETING_LIST: 30,
  MEETING_DETAIL: 60,
  PARTICIPANTS: 15,
} as const;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').substring(0, 32)
  : crypto.createHash('sha256').update('fallback-secret-do-not-use-in-prod').digest('base64').substring(0, 32);

function encryptPasscode(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptPasscode(text: string | null): string | null {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}
@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private botService: LiveKitBotService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}
  async createMeeting(hostId: string, dto: CreateMeetingDto) {
    const rawPasscode = Math.floor(100000 + Math.random() * 900000).toString();
    const roomName = crypto.randomBytes(8).toString('hex');
    const meeting = await this.prisma.meeting.create({
      data: {
        hostId,
        groupId: dto.groupId,
        title: dto.title,
        description: dto.description,
        platform: dto.platform as any,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        durationMinutes: dto.durationMinutes,
        status: 'SCHEDULED',
        livekitRoomName: roomName,
        passcode: encryptPasscode(rawPasscode),
      },
      select: {
        id: true,
        title: true,
        description: true,
        platform: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        createdAt: true,
        livekitRoomName: true,
        host: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    await this.cache.del(`meetings:user:${hostId}`);
    if (dto.groupId) {
      this.prisma.enrollment
        .findMany({ where: { groupId: dto.groupId } })
        .then((enrollments) => {
          enrollments.forEach((enrollment) => {
            this.notificationsService
              .createNotification({
                userId: enrollment.studentId,
                type: NotifType.MEETING_SCHEDULED,
                title: 'New Meeting Scheduled',
                body: `A new meeting "${dto.title}" has been scheduled for your group.`,
                actionUrl: `/dashboard-student/upcoming`,
                sendEmail: true,
              })
              .catch((e) => console.error(e));
          });
        });
    }
    return {
      status: 'success',
      data: { ...meeting, plainPasscode: rawPasscode },
    };
  }
  async getAllMeetings(userId: string) {
    const cacheKey = `meetings:user:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return { status: 'success', data: cached };
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ hostId: userId }, { participants: { some: { userId } } }],
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        platform: true,
        scheduledAt: true,
        durationMinutes: true,
        startedAt: true,
        endedAt: true,
        createdAt: true,
        groupId: true,
        livekitRoomName: true,
        passcode: true,
        group: { select: { name: true } },
        host: { select: { id: true, name: true, email: true } },
        _count: { select: { participants: true, materials: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const decryptedMeetings = meetings.map(m => ({
      ...m,
      passcode: decryptPasscode(m.passcode)
    }));
    
    await this.cache.set(cacheKey, decryptedMeetings, CACHE_TTL.MEETING_LIST);
    return { status: 'success', data: decryptedMeetings };
  }
  async getUpcomingMeetings(userId: string) {
    const now = new Date();
    const meetings = await this.prisma.meeting.findMany({
      where: {
        hostId: userId,
        status: { in: ['SCHEDULED', 'LIVE'] },
        scheduledAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
            _count: { select: { enrollments: true } },
          },
        },
        livekitRoomName: true,
        passcode: true, // we'll need this for instructor to see
      },
      orderBy: { scheduledAt: 'asc' },
    });
    
    const decryptedMeetings = meetings.map(m => ({
      ...m,
      passcode: decryptPasscode(m.passcode)
    }));
    
    return { status: 'success', data: decryptedMeetings };
  }
  async getTodayMeetings(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const meetings = await this.prisma.meeting.findMany({
      where: {
        hostId: userId,
        scheduledAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
            _count: { select: { enrollments: true } },
          },
        },
        livekitRoomName: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return { status: 'success', data: meetings };
  }
  async getPreviousMeetings(userId: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        hostId: userId,
        status: 'ENDED',
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        startedAt: true,
        endedAt: true,
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
            _count: { select: { enrollments: true } },
          },
        },
        participants: {
          select: { avgEngagementScore: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    const mappedMeetings = meetings.map((m) => {
      let sum = 0;
      let count = 0;
      m.participants.forEach((p) => {
        if (p.avgEngagementScore !== null) {
          sum += p.avgEngagementScore;
          count++;
        }
      });
      const rawAvg = count > 0 ? sum / count : 0;
      const avg =
        rawAvg <= 1 && rawAvg > 0
          ? Math.round(rawAvg * 100)
          : Math.round(rawAvg);
      const { participants, ...rest } = m;
      return { ...rest, avgEngagement: avg };
    });
    return { status: 'success', data: mappedMeetings };
  }
  async getStudentUpcomingMeetings(userId: string) {
    const now = new Date();
    const meetings = await this.prisma.meeting.findMany({
      where: {
        group: { enrollments: { some: { studentId: userId } } },
        status: { in: ['SCHEDULED', 'LIVE'] },
        scheduledAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
            _count: { select: { enrollments: true } },
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return { status: 'success', data: meetings };
  }
  async getStudentTodayMeetings(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const meetings = await this.prisma.meeting.findMany({
      where: {
        group: { enrollments: { some: { studentId: userId } } },
        scheduledAt: { gte: start, lte: end },
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        startedAt: true,
        endedAt: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
            _count: { select: { enrollments: true } },
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return { status: 'success', data: meetings };
  }
  async getStudentPreviousMeetings(userId: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        group: { enrollments: { some: { studentId: userId } } },
        status: 'ENDED',
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        startedAt: true,
        endedAt: true,
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } },
              },
              take: 5,
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return { status: 'success', data: meetings };
  }
  async getMeetingById(meetingId: string, userId: string) {
    const cacheKey = `meeting:${meetingId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      const isHost = cached.host.id === userId;
      const isParticipant = cached.participants.some(
        (p: any) => p.user.id === userId,
      );
      if (!isHost && !isParticipant) {
        throw new ForbiddenException('You are not part of this meeting');
      }
      return { status: 'success', data: cached };
    }
    const meeting = await this.prisma.meeting.findFirst({
      where: { OR: [{ id: meetingId }, { livekitRoomName: meetingId }] },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        platform: true,
        passcode: true,
        livekitRoomName: true,
        livekitRoomSid: true,
        joinToken: true,
        scheduledAt: true,
        durationMinutes: true,
        startedAt: true,
        endedAt: true,
        createdAt: true,
        host: { select: { id: true, name: true, email: true } },
        participants: {
          select: {
            id: true,
            role: true,
            consentGiven: true,
            joinedAt: true,
            leftAt: true,
            secondsPresent: true,
            avgEngagementScore: true,
            adhdFlagged: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        materials: {
          select: {
            id: true,
            fileName: true,
            driveViewUrl: true,
            mimeType: true,
            sizeBytes: true,
            uploadedAt: true,
            uploader: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const isHost = meeting.host.id === userId;
    const isParticipant = meeting.participants.some(
      (p) => p.user.id === userId,
    );
    if (!isHost && !isParticipant) {
      throw new ForbiddenException('You are not part of this meeting');
    }
    
    if (meeting.passcode) {
      meeting.passcode = decryptPasscode(meeting.passcode);
    }
    
    await this.cache.set(cacheKey, meeting, CACHE_TTL.MEETING_DETAIL);
    return { status: 'success', data: meeting };
  }
  async updateMeeting(
    meetingId: string,
    hostId: string,
    dto: UpdateMeetingDto,
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, hostId: true, status: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostId) {
      throw new ForbiddenException('Only the host can update this meeting');
    }
    const updated = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.platform && { platform: dto.platform as any }),
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.durationMinutes && { durationMinutes: dto.durationMinutes }),
        ...(dto.livekitRoomName && { livekitRoomName: dto.livekitRoomName }),
        ...(dto.livekitRoomSid && { livekitRoomSid: dto.livekitRoomSid }),
        ...(dto.joinToken && { joinToken: dto.joinToken }),
        ...(dto.status === 'LIVE' && { startedAt: new Date() }),
        ...(dto.status === 'ENDED' && { endedAt: new Date() }),
      },
      select: {
        id: true,
        title: true,
        status: true,
        platform: true,
        scheduledAt: true,
        durationMinutes: true,
        startedAt: true,
        endedAt: true,
      },
    });
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${hostId}`),
      this.cache.del(`participants:${meetingId}`),
    ]);
    if (dto.status === 'ENDED' && meeting.status !== 'ENDED') {
      this.notificationsService
        .createNotification({
          userId: hostId,
          type: NotifType.ANALYTICS_READY,
          title: 'Meeting Analytics Ready',
          body: `The analytics report for "${updated.title}" is now available.`,
          actionUrl: `/dashboard-instructor/analytics?meetingId=${meetingId}`,
          sendEmail: true,
        })
        .catch((e) => console.error(e));
    }
    return { status: 'success', data: updated };
  }
  async deleteMeeting(meetingId: string, hostId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, hostId: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostId) {
      throw new ForbiddenException('Only the host can delete this meeting');
    }
    await this.prisma.meeting.delete({ where: { id: meetingId } });
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${hostId}`),
      this.cache.del(`participants:${meetingId}`),
    ]);
    return { status: 'success', message: 'Meeting deleted successfully' };
  }
  async shareMeeting(meetingId: string, hostId: string, groupId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { host: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostId) {
      throw new ForbiddenException('Only the host can share this meeting');
    }
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { enrollments: { include: { student: true } } },
    });
    if (!group) throw new NotFoundException('Group not found');
    const rawPasscode = meeting.passcode
      ? decryptPasscode(meeting.passcode) || Math.floor(100000 + Math.random() * 900000).toString()
      : Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { passcode: encryptPasscode(rawPasscode), groupId },
    });
    const studentCachePromises = group.enrollments.map((e) =>
      this.cache.del(`meetings:user:${e.student.id}`),
    );
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${hostId}`),
      ...studentCachePromises,
    ]);
    const students = group.enrollments.map((e) => ({
      email: e.student.email,
      name: e.student.name,
    }));
    if (students.length === 0) {
      return {
        status: 'success',
        message: 'Group has no students to notify',
        passcode: rawPasscode,
      };
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const joinUrl = `${frontendUrl}/meeting/join/${meeting.id}`;
    await this.emailService.sendMeetingInvitations(students, {
      meetingTitle: meeting.title,
      instructorName: meeting.host.name,
      scheduledAt: meeting.scheduledAt
        ? meeting.scheduledAt.toLocaleString()
        : 'TBD',
      passcode: rawPasscode,
      joinUrl,
    });
    return {
      status: 'success',
      message: 'Meeting shared successfully',
      passcode: rawPasscode,
    };
  }
  async joinMeeting(
    meetingIdOrRoom: string,
    userId: string,
    dto: JoinMeetingDto,
  ) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingIdOrRoom }, { livekitRoomName: meetingIdOrRoom }],
      },
      select: {
        id: true,
        status: true,
        hostId: true,
        passcode: true,
        livekitRoomName: true,
        group: { select: { enrollments: { where: { studentId: userId } } } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const meetingId = meeting.id;
    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      throw new BadRequestException('This meeting is no longer active');
    }
    const existing = await this.prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
      select: {
        id: true,
        role: true,
        consentGiven: true,
        joinedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    const isGuest =
      meeting.hostId !== userId &&
      (!meeting.group || meeting.group.enrollments.length === 0);
    if (existing) {
      return {
        status: 'success',
        data: {
          participant: existing,
          livekitRoomName: meeting.livekitRoomName,
          isGuest,
        },
      };
    }
    if (meeting.hostId !== userId) {
      let isValidPasscode = false;
      if (meeting.passcode) {
        const decryptedPasscode = decryptPasscode(meeting.passcode);
        if (decryptedPasscode === dto.passcode) {
          isValidPasscode = true;
        } else {
          try {
            isValidPasscode = await Bun.password.verify(dto.passcode, meeting.passcode);
          } catch (e) {}
        }
      }
      if (!isValidPasscode) {
        throw new ForbiddenException('Invalid passcode');
      }
    }
    const role = meeting.hostId === userId ? 'HOST' : 'PARTICIPANT';
    const participant = await this.prisma.meetingParticipant.create({
      data: {
        meetingId,
        userId,
        role: role as any,
        consentGiven: dto.consentGiven ?? false,
        joinedAt: new Date(),
      },
      select: {
        id: true,
        role: true,
        consentGiven: true,
        joinedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    await Promise.all([
      this.cache.del(`participants:${meetingId}`),
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${userId}`),
    ]);
    return {
      status: 'success',
      data: { participant, livekitRoomName: meeting.livekitRoomName, isGuest },
    };
  }
  async startMeeting(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, hostId: true, livekitRoomName: true, status: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can start this meeting');
    }
    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      throw new BadRequestException('This meeting has already ended');
    }
    if (meeting.status === 'SCHEDULED') {
      await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'LIVE', startedAt: new Date() },
      });
      await this.cache.del(`meeting:${meetingId}`);
    }

    if (meeting.livekitRoomName) {
      this.botService
        .dispatchBotToRoom(meeting.livekitRoomName)
        .catch((err) => {
          console.error('Failed to dispatch bot:', err);
        });
    }
    return {
      status: 'success',
      data: { livekitRoomName: meeting.livekitRoomName },
    };
  }
  async endMeeting(meetingIdOrRoom: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingIdOrRoom }, { livekitRoomName: meetingIdOrRoom }],
      },
      select: { id: true, hostId: true, livekitRoomName: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const meetingId = meeting.id;
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can end this meeting');
    }
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'ENDED', endedAt: new Date() },
    });
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${userId}`),
      this.cache.del(`participants:${meetingId}`),
    ]);
    if (meeting.livekitRoomName) {
      const roomService = new RoomServiceClient(
        process.env.LIVEKIT_URL || process.env.LIVEKIT_API_URL || '',
        process.env.LIVEKIT_API_KEY || '',
        process.env.LIVEKIT_API_SECRET || '',
      );
      // Recall bot first, then delete room — both awaited so errors surface clearly
      try {
        await this.botService.recallBotFromRoom(meeting.livekitRoomName);
      } catch (err) {
        console.error('[endMeeting] Failed to recall bot:', err);
      }
      try {
        await roomService.deleteRoom(meeting.livekitRoomName);
        console.log(`[endMeeting] LiveKit room deleted: ${meeting.livekitRoomName}`);
      } catch (err) {
        console.error('[endMeeting] CRITICAL: Failed to delete LiveKit room — ghost session may be active:', err);
      }
    }
    return { status: 'success', message: 'Meeting ended successfully' };
  }

  /** Called by the LiveKit webhook when a room empties — no userId check needed */
  async endMeetingByRoomName(roomName: string): Promise<void> {
    const meeting = await this.prisma.meeting.findFirst({
      where: { livekitRoomName: roomName, status: 'LIVE' },
      select: { id: true, hostId: true },
    });
    if (!meeting) return; // Already ended or not found — nothing to do

    await this.prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'ENDED', endedAt: new Date() },
    });
    await Promise.all([
      this.cache.del(`meeting:${meeting.id}`),
      this.cache.del(`meetings:user:${meeting.hostId}`),
      this.cache.del(`participants:${meeting.id}`),
    ]);
    console.log(`[Webhook] ✅ DB meeting ended for room: ${roomName} (id: ${meeting.id})`);
  }

  async leaveMeeting(meetingIdOrRoom: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingIdOrRoom }, { livekitRoomName: meetingIdOrRoom }],
      },
      select: { id: true, hostId: true, livekitRoomName: true, status: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const meetingId = meeting.id;
    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
    });
    if (participant) {
      const leftAt = new Date();
      const secondsPresent = participant.joinedAt
        ? Math.floor((leftAt.getTime() - participant.joinedAt.getTime()) / 1000)
        : 0;
      await this.prisma.meetingParticipant.update({
        where: { meetingId_userId: { meetingId, userId } },
        data: {
          leftAt,
          secondsPresent: participant.secondsPresent + secondsPresent,
        },
      });
    }
    const activeParticipants = await this.prisma.meetingParticipant.findMany({
      where: {
        meetingId,
        leftAt: null,
        user: { email: { not: { contains: 'bot' } } },
      },
    });

    let remainingCount = activeParticipants.length;
    if (meeting.livekitRoomName) {
      try {
        const roomService = new RoomServiceClient(
          process.env.LIVEKIT_URL || process.env.LIVEKIT_API_URL || '',
          process.env.LIVEKIT_API_KEY || '',
          process.env.LIVEKIT_API_SECRET || '',
        );
        const lkParticipants = await roomService.listParticipants(
          meeting.livekitRoomName,
        );
        const actualUsers = lkParticipants.filter(
          (p) =>
            p.identity !== userId &&
            !p.identity.includes('bot') &&
            p.identity !== 'engagement-bot',
        );
        remainingCount = actualUsers.length;
      } catch (err) {
        remainingCount = 0;
      }
    }

    if (meeting.status === 'LIVE' && (remainingCount === 0 || activeParticipants.length === 0)) {
      const endedMeeting = await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'ENDED', endedAt: new Date() },
      });
      await this.cache.del(`meetings:user:${endedMeeting.hostId}`);
      if (endedMeeting.livekitRoomName) {
        this.botService
          .recallBotFromRoom(endedMeeting.livekitRoomName)
          .catch((err) => {
            console.error('Failed to recall bot:', err);
          });
        const roomService = new RoomServiceClient(
          process.env.LIVEKIT_URL || process.env.LIVEKIT_API_URL || '',
          process.env.LIVEKIT_API_KEY || '',
          process.env.LIVEKIT_API_SECRET || '',
        );
        roomService
          .deleteRoom(endedMeeting.livekitRoomName)
          .catch((err: any) => {
            console.error('Failed to delete LiveKit room on auto-end:', err);
          });
      }
    }
    await Promise.all([
      this.cache.del(`participants:${meetingId}`),
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${userId}`),
    ]);
    return { status: 'success', message: 'Successfully left the meeting' };
  }
  async getMeetingParticipants(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        hostId: true,
        participants: { select: { userId: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const isHost = meeting.hostId === userId;
    const isParticipant = meeting.participants.some((p) => p.userId === userId);
    if (!isHost && !isParticipant) {
      throw new ForbiddenException('You are not part of this meeting');
    }
    const cacheKey = `participants:${meetingId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return { status: 'success', data: cached };
    const participants = await this.prisma.meetingParticipant.findMany({
      where: { meetingId },
      select: {
        id: true,
        role: true,
        consentGiven: true,
        joinedAt: true,
        leftAt: true,
        secondsPresent: true,
        avgEngagementScore: true,
        adhdFlagged: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
    await this.cache.set(cacheKey, participants, CACHE_TTL.PARTICIPANTS);
    return { status: 'success', data: participants };
  }
  async updateParticipant(
    meetingId: string,
    participantId: string,
    hostId: string,
    dto: UpdateParticipantDto,
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, hostId: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostId) {
      throw new ForbiddenException(
        'Only the host can update participant metrics',
      );
    }
    const updated = await this.prisma.meetingParticipant.update({
      where: { id: participantId },
      data: {
        ...(dto.secondsPresent !== undefined && {
          secondsPresent: dto.secondsPresent,
        }),
        ...(dto.avgEngagementScore !== undefined && {
          avgEngagementScore: dto.avgEngagementScore,
        }),
        ...(dto.adhdFlagged !== undefined && { adhdFlagged: dto.adhdFlagged }),
      },
      select: {
        id: true,
        secondsPresent: true,
        avgEngagementScore: true,
        adhdFlagged: true,
      },
    });
    await this.cache.del(`participants:${meetingId}`);
    return { status: 'success', data: updated };
  }
  async addMaterial(
    meetingId: string,
    uploadedBy: string,
    dto: AddMaterialDto,
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        hostId: true,
        participants: { select: { userId: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const isHost = meeting.hostId === uploadedBy;
    const isParticipant = meeting.participants.some(
      (p) => p.userId === uploadedBy,
    );
    if (!isHost && !isParticipant) {
      throw new ForbiddenException('Only meeting members can upload materials');
    }
    const material = await this.prisma.meetingMaterial.create({
      data: {
        meetingId,
        uploadedBy,
        fileName: dto.fileName,
        driveFileId: dto.driveFileId,
        driveViewUrl: dto.driveViewUrl,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
      },
      select: {
        id: true,
        fileName: true,
        driveFileId: true,
        driveViewUrl: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
        uploader: { select: { id: true, name: true } },
      },
    });
    return { status: 'success', data: material };
  }
  async getMeetingMaterials(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        hostId: true,
        participants: { select: { userId: true } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const isHost = meeting.hostId === userId;
    const isParticipant = meeting.participants.some((p) => p.userId === userId);
    if (!isHost && !isParticipant) {
      throw new ForbiddenException('You are not part of this meeting');
    }
    const materials = await this.prisma.meetingMaterial.findMany({
      where: { meetingId },
      select: {
        id: true,
        fileName: true,
        driveFileId: true,
        driveViewUrl: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
        uploader: { select: { id: true, name: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return { status: 'success', data: materials };
  }
  async deleteMaterial(meetingId: string, materialId: string, userId: string) {
    const material = await this.prisma.meetingMaterial.findUnique({
      where: { id: materialId },
      select: {
        id: true,
        meetingId: true,
        uploadedBy: true,
        meeting: { select: { hostId: true } },
      },
    });
    if (!material) throw new NotFoundException('Material not found');
    if (material.meetingId !== meetingId) {
      throw new BadRequestException('Material does not belong to this meeting');
    }
    const isHost = material.meeting.hostId === userId;
    const isOwner = material.uploadedBy === userId;
    if (!isHost && !isOwner) {
      throw new ForbiddenException(
        'Only the uploader or the host can delete this material',
      );
    }
    await this.prisma.meetingMaterial.delete({ where: { id: materialId } });
    return { status: 'success', message: 'Material deleted successfully' };
  }
  async syncEngagement(
    meetingId: string,
    stats: {
      participantIdentity: string;
      avgEngagementScore: number;
      adhdFlagged: boolean;
    }[],
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { user: true } } },
    });
    if (!meeting) return { success: false };
    for (const stat of stats) {
      const p = meeting.participants.find(
        (mp) =>
          mp.user.name === stat.participantIdentity ||
          mp.user.email === stat.participantIdentity ||
          mp.user.id === stat.participantIdentity,
      );
      if (p) {
        await this.prisma.meetingParticipant.update({
          where: { id: p.id },
          data: {
            avgEngagementScore: stat.avgEngagementScore,
            adhdFlagged: stat.adhdFlagged,
          },
        });
      }
    }
    await this.cache.del(`participants:${meetingId}`);
    return { success: true };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupGhostMeetings() {
    let liveMeetings: { id: string; livekitRoomName: string | null; hostId: string; startedAt: Date | null }[] = [];
    try {
      liveMeetings = await this.prisma.meeting.findMany({
        where: { status: 'LIVE' },
        select: { id: true, livekitRoomName: true, hostId: true, startedAt: true },
      });
    } catch (err: any) {
      // Ignore database connection timeouts caused by Neon serverless cold starts.
      if (err.code === 'P1001') {
        console.warn(`[Cron] Database is sleeping/waking up. Skipping cleanup cycle.`);
        return;
      }
      console.error(`[Cron] Error fetching live meetings: ${err.message}`);
      return;
    }

    console.log(`[Cron] cleanupGhostMeetings running. Found ${liveMeetings.length} LIVE meeting(s).`);
    if (liveMeetings.length === 0) return;

    const roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL || process.env.LIVEKIT_API_URL || '',
      process.env.LIVEKIT_API_KEY || '',
      process.env.LIVEKIT_API_SECRET || '',
    );

    for (const meeting of liveMeetings) {
      if (!meeting.livekitRoomName) continue;

      let shouldEnd = false;
      const durationMinutes = meeting.startedAt ? (Date.now() - meeting.startedAt.getTime()) / 60000 : 0;
      const MAX_DURATION = 45; // 45-minute hard limit

      try {
        const lkParticipants = await roomService.listParticipants(
          meeting.livekitRoomName,
        );
        // Filter out any AI bot identities — they all follow the pattern ai-bot-*
        const actualUsers = lkParticipants.filter(
          (p) =>
            !p.identity.startsWith('ai-bot-') &&
            !p.identity.includes('bot') &&
            p.identity !== 'engagement-bot',
        );
        
        console.log(`[Cron] Room ${meeting.livekitRoomName}: ${lkParticipants.length} total, ${actualUsers.length} human(s), Duration: ${Math.round(durationMinutes)}m.`);
        
        const GRACE_PERIOD = 10; // 10 minutes grace period for users to join
        if (actualUsers.length === 0) {
          if (durationMinutes > GRACE_PERIOD) {
            console.log(`[Cron] Room ${meeting.livekitRoomName} is empty and exceeded ${GRACE_PERIOD}m grace period. Auto-cleaning.`);
            shouldEnd = true;
          } else {
            console.log(`[Cron] Room ${meeting.livekitRoomName} is empty, but within ${GRACE_PERIOD}m grace period. Letting it live.`);
          }
        } else if (durationMinutes > MAX_DURATION) {
          console.log(`[Cron] Room ${meeting.livekitRoomName} exceeded max duration of ${MAX_DURATION} minutes. Force closing.`);
          shouldEnd = true;
        }
      } catch (err) {
        // Room does not exist in LiveKit at all — definitely end it
        console.log(`[Cron] Room ${meeting.livekitRoomName} not found in LiveKit (already gone). Marking as ENDED.`);
        shouldEnd = true;
      }

      if (shouldEnd) {
        await this.prisma.meeting.update({
          where: { id: meeting.id },
          data: { status: 'ENDED', endedAt: new Date() },
        });

        await Promise.all([
          this.cache.del(`meeting:${meeting.id}`),
          this.cache.del(`meetings:user:${meeting.hostId}`),
          this.cache.del(`participants:${meeting.id}`),
        ]);

        // Force-kill the room in LiveKit (this disconnects the bot too)
        try {
          await roomService.deleteRoom(meeting.livekitRoomName);
          console.log(`[Cron] ✅ LiveKit room force-deleted: ${meeting.livekitRoomName}`);
        } catch (e) {
          console.log(`[Cron] Room already gone from LiveKit: ${meeting.livekitRoomName}`);
        }

        // Also signal dispatch_server to terminate the bot process
        this.botService.recallBotFromRoom(meeting.livekitRoomName).catch(() =>
          console.log(`[Cron] Recall signal sent (bot may already be gone).`),
        );
        
        console.log(`[Cron] ✅ Auto-cleaned ghost meeting: ${meeting.id}`);
      }
    }
  }
}
