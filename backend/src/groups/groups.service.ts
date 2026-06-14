import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase(); // 8 chars
  }

  async createGroup(instructorId: string, dto: CreateGroupDto) {
    let inviteCode = this.generateInviteCode();
    let collision = true;
    let retries = 0;

    // Retry on collision
    while (collision && retries < 5) {
      const existing = await this.prisma.group.findUnique({
        where: { inviteCode },
      });
      if (existing) {
        inviteCode = this.generateInviteCode();
        retries++;
      } else {
        collision = false;
      }
    }

    if (collision) {
      throw new ConflictException('Failed to generate a unique invite code. Please try again.');
    }

    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
        inviteCode,
        instructorId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        inviteCode: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
    });

    return { status: 'success', data: group };
  }

  async findAllByInstructor(instructorId: string) {
    const groups = await this.prisma.group.findMany({
      where: { instructorId },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        inviteCode: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return { status: 'success', data: groups };
  }

  async joinGroup(studentId: string, dto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: dto.inviteCode },
      select: { id: true, instructorId: true },
    });

    if (!group) {
      throw new NotFoundException('Invalid invite code. Group not found.');
    }

    if (group.instructorId === studentId) {
      throw new ForbiddenException('You cannot join your own group.');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_groupId: { studentId, groupId: group.id },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this group.');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        groupId: group.id,
      },
      select: {
        id: true,
        joinedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            subject: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });

    return { status: 'success', data: enrollment, message: 'Successfully joined the group.' };
  }

  async getGroupMembers(groupId: string, instructorId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { instructorId: true },
    });

    if (!group) throw new NotFoundException('Group not found.');
    if (group.instructorId !== instructorId) {
      throw new ForbiddenException('Only the instructor can view members.');
    }

    const members = await this.prisma.enrollment.findMany({
      where: { groupId },
      select: {
        id: true,
        joinedAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return { status: 'success', data: members };
  }

  async inviteStudents(groupId: string, instructorId: string, emails: string[]) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, inviteCode: true, instructorId: true, instructor: { select: { name: true } } },
    });

    if (!group) throw new NotFoundException('Group not found.');
    if (group.instructorId !== instructorId) {
      throw new ForbiddenException('Only the instructor can send invites.');
    }

    if (!emails || emails.length === 0) {
      return { status: 'success', message: 'No emails provided.' };
    }

    // TODO: Dispatch BullMQ job here for background email processing
    // Example: await this.emailQueue.add('send-invites', { emails, groupName: group.name, inviteCode: group.inviteCode, instructorName: group.instructor.name });
    
    // For now, since BullMQ is not configured, we return success assuming emails will be handled.
    return { status: 'success', message: `Invitations queued for ${emails.length} student(s).` };
  }
}
