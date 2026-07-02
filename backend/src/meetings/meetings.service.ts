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

// ── Cache TTLs (seconds) ──────────────────────────────────────────────────────
const CACHE_TTL = {
  MEETING_LIST: 30,
  MEETING_DETAIL: 60,
  PARTICIPANTS: 15,
} as const;

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private botService: LiveKitBotService,
    private emailService: EmailService,
  ) {}

  // =========================
  // MEETINGS — CRUD
  // =========================

  async createMeeting(hostId: string, dto: CreateMeetingDto) {
    const crypto = require('crypto');
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
        passcode: rawPasscode,
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

    // Invalidate caches
    await this.cache.del(`meetings:user:${hostId}`);

    return { status: 'success', data: { ...meeting, plainPasscode: rawPasscode } };
  }

  async getAllMeetings(userId: string) {
    // ── Cache hit ──
    const cacheKey = `meetings:user:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return { status: 'success', data: cached };

    // Returns meetings the user hosts OR participates in
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          { participants: { some: { userId } } },
        ],
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

    await this.cache.set(cacheKey, meetings, CACHE_TTL.MEETING_LIST);
    return { status: 'success', data: meetings };
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
                student: { select: { name: true, avatarUrl: true } }
              },
              take: 5
            }
          }
        },
        livekitRoomName: true,
        passcode: true, // we'll need this for instructor to see
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return { status: 'success', data: meetings };
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
                student: { select: { name: true, avatarUrl: true } }
              },
              take: 5
            }
          }
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
        durationMinutes: true,
        groupId: true,
        group: {
          select: {
            name: true,
            enrollments: {
              select: {
                student: { select: { name: true, avatarUrl: true } }
              },
              take: 5
            }
          }
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return { status: 'success', data: meetings };
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
        group: { select: { name: true } },
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
        durationMinutes: true,
        groupId: true,
        group: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return { status: 'success', data: meetings };
  }

  async getMeetingById(meetingId: string, userId: string) {
    // ── Cache hit ──
    const cacheKey = `meeting:${meetingId}`;
    const cached = await this.cache.get<any>(cacheKey);

    // Even on cache hit we must enforce authorization
    if (cached) {
      const isHost = cached.host.id === userId;
      const isParticipant = cached.participants.some((p: any) => p.user.id === userId);
      if (!isHost && !isParticipant) {
        throw new ForbiddenException('You are not part of this meeting');
      }
      return { status: 'success', data: cached };
    }

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
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

    // Only host or participant can see meeting details
    const isHost = meeting.host.id === userId;
    const isParticipant = meeting.participants.some((p) => p.user.id === userId);
    if (!isHost && !isParticipant) {
      throw new ForbiddenException('You are not part of this meeting');
    }

    await this.cache.set(cacheKey, meeting, CACHE_TTL.MEETING_DETAIL);
    return { status: 'success', data: meeting };
  }

  async updateMeeting(meetingId: string, hostId: string, dto: UpdateMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, hostId: true },
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
        // Auto-set timestamps based on status changes
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

    // Invalidate meeting + host list caches
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${hostId}`),
      this.cache.del(`participants:${meetingId}`),
    ]);

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

    // Invalidate all caches related to this meeting
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

    // Use the existing plain text passcode so the email perfectly matches the dashboard card
    const rawPasscode = meeting.passcode || Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { passcode: rawPasscode, groupId },
    });

    // Invalidate host and student caches to ensure instant dashboard synchronization
    const studentCachePromises = group.enrollments.map((e) => this.cache.del(`meetings:user:${e.student.id}`));
    await Promise.all([
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${hostId}`),
      ...studentCachePromises,
    ]);

    // Extract students
    const students = group.enrollments.map((e) => ({
      email: e.student.email,
      name: e.student.name,
    }));

    if (students.length === 0) {
      return { status: 'success', message: 'Group has no students to notify', passcode: rawPasscode };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const joinUrl = `${frontendUrl}/meeting/join/${meeting.id}`;

    await this.emailService.sendMeetingInvitations(students, {
      meetingTitle: meeting.title,
      instructorName: meeting.host.name,
      scheduledAt: meeting.scheduledAt ? meeting.scheduledAt.toLocaleString() : 'TBD',
      passcode: rawPasscode,
      joinUrl,
    });

    return { status: 'success', message: 'Meeting shared successfully', passcode: rawPasscode };
  }

  // =========================
  // PARTICIPANTS
  // =========================

  async joinMeeting(meetingIdOrRoom: string, userId: string, dto: JoinMeetingDto) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [
          { id: meetingIdOrRoom },
          { livekitRoomName: meetingIdOrRoom },
        ],
      },
      select: { id: true, status: true, hostId: true, passcode: true, livekitRoomName: true, group: { select: { enrollments: { where: { studentId: userId } } } } },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');
    const meetingId = meeting.id;

    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      throw new BadRequestException('This meeting is no longer active');
    }

    // Check if already in the meeting (Seamless Reconnection)
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

    if (existing) {
      // If the user is already a recognized participant, let them back in seamlessly!
      return { status: 'success', data: { participant: existing, livekitRoomName: meeting.livekitRoomName } };
    }

    if (meeting.hostId !== userId) {
      // Validate Passcode
      let isValidPasscode = false;
      if (meeting.passcode) {
        // Since we stopped hashing, we check plain text first
        if (meeting.passcode === dto.passcode) {
          isValidPasscode = true;
        } else {
          // Fallback check if it was an older meeting with a hashed passcode
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

    // Invalidate participant + meeting caches
    await Promise.all([
      this.cache.del(`participants:${meetingId}`),
      this.cache.del(`meeting:${meetingId}`),
      this.cache.del(`meetings:user:${userId}`),
    ]);

    return { status: 'success', data: { participant, livekitRoomName: meeting.livekitRoomName } };
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

    if (meeting.status === 'SCHEDULED') {
      await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'LIVE', startedAt: new Date() },
      });
      await this.cache.del(`meeting:${meetingId}`);
      
      // Dispatch the AI bot to the room seamlessly
      if (meeting.livekitRoomName) {
        this.botService.dispatchBotToRoom(meeting.livekitRoomName).catch(err => {
          console.error("Failed to dispatch bot:", err);
        });
      }
    }

    return { status: 'success', data: { livekitRoomName: meeting.livekitRoomName } };
  }

  async endMeeting(meetingIdOrRoom: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [
          { id: meetingIdOrRoom },
          { livekitRoomName: meetingIdOrRoom },
        ],
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
    
    // Recall the AI bot to free GPU resources
    if (meeting.livekitRoomName) {
      this.botService.recallBotFromRoom(meeting.livekitRoomName).catch(err => {
        console.error("Failed to recall bot:", err);
      });

      // Forcefully close the LiveKit room to kick all participants out
      const { RoomServiceClient } = require('livekit-server-sdk');
      const roomService = new RoomServiceClient(
        process.env.LIVEKIT_API_URL,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
      );
      roomService.deleteRoom(meeting.livekitRoomName).catch((err: any) => {
        console.error("Failed to delete LiveKit room:", err);
      });
    }

    return { status: 'success', message: 'Meeting ended successfully' };
  }

  async leaveMeeting(meetingIdOrRoom: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [
          { id: meetingIdOrRoom },
          { livekitRoomName: meetingIdOrRoom },
        ],
      },
      select: { id: true, hostId: true, livekitRoomName: true },
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

    // Check if there are any remaining active human participants
    const activeParticipants = await this.prisma.meetingParticipant.findMany({
      where: {
        meetingId,
        leftAt: null,
        user: { email: { not: { contains: 'bot' } } },
      },
    });

    if (activeParticipants.length === 0) {
      const endedMeeting = await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'ENDED', endedAt: new Date() },
      });
      await this.cache.del(`meetings:user:${endedMeeting.hostId}`);
      if (endedMeeting.livekitRoomName) {
        this.botService.recallBotFromRoom(endedMeeting.livekitRoomName).catch(err => {
          console.error("Failed to recall bot:", err);
        });
      }
    }

    // Invalidate participant + meeting caches
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

    // ── Cache hit ──
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

    // Invalidate participant cache after metric update
    await this.cache.del(`participants:${meetingId}`);

    return { status: 'success', data: updated };
  }

  // =========================
  // MATERIALS
  // =========================

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
      throw new ForbiddenException(
        'Only meeting members can upload materials',
      );
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

  async deleteMaterial(
    meetingId: string,
    materialId: string,
    userId: string,
  ) {
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
}
