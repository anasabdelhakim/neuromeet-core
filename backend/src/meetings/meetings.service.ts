import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  JoinMeetingDto,
  UpdateParticipantDto,
  AddMaterialDto,
} from './dto/meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // MEETINGS — CRUD
  // =========================

  async createMeeting(hostId: string, dto: CreateMeetingDto) {
    const meeting = await this.prisma.meeting.create({
      data: {
        hostId,
        title: dto.title,
        description: dto.description,
        platform: dto.platform as any,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        durationMinutes: dto.durationMinutes,
        status: 'SCHEDULED',
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
        host: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return { status: 'success', data: meeting };
  }

  async getAllMeetings(userId: string) {
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
        host: { select: { id: true, name: true, email: true } },
        _count: { select: { participants: true, materials: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { status: 'success', data: meetings };
  }

  async getMeetingById(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        platform: true,
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

    return { status: 'success', message: 'Meeting deleted successfully' };
  }

  // =========================
  // PARTICIPANTS
  // =========================

  async joinMeeting(meetingId: string, userId: string, dto: JoinMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, status: true, hostId: true },
    });

    if (!meeting) throw new NotFoundException('Meeting not found');

    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      throw new BadRequestException('This meeting is no longer active');
    }

    // Check if already in the meeting
    const existing = await this.prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
    });

    if (existing) {
      throw new ConflictException('You have already joined this meeting');
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

    return { status: 'success', data: participant };
  }

  async leaveMeeting(meetingId: string, userId: string) {
    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant of this meeting');
    }

    const leftAt = new Date();
    const secondsPresent = participant.joinedAt
      ? Math.floor((leftAt.getTime() - participant.joinedAt.getTime()) / 1000)
      : 0;

    const updated = await this.prisma.meetingParticipant.update({
      where: { meetingId_userId: { meetingId, userId } },
      data: {
        leftAt,
        secondsPresent: participant.secondsPresent + secondsPresent,
      },
      select: {
        id: true,
        leftAt: true,
        secondsPresent: true,
      },
    });

    return { status: 'success', data: updated };
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
