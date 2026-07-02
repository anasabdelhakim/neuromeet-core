import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createGroup(instructorId: string, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
        instructorId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
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
        created_at: true,
        _count: { select: { enrollments: true } },
        enrollments: {
          select: {
            student: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        },
        invitations: {
          where: { status: 'PENDING' },
          select: { studentId: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    return { status: 'success', data: groups };
  }

  async findAllByStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: {
        id: true,
        joinedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: true,
            instructor: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return { status: 'success', data: enrollments };
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


  async updateGroup(groupId: string, instructorId: string, dto: any) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.instructorId !== instructorId) {
      throw new ForbiddenException('Only the instructor can update this group');
    }

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
      },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
    });

    return { status: 'success', data: updated, message: 'Group updated successfully' };
  }

  async deleteGroup(groupId: string, instructorId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new NotFoundException('Group not found');
    if (group.instructorId !== instructorId) {
      throw new ForbiddenException('Only the instructor can delete this group');
    }

    await this.prisma.group.delete({
      where: { id: groupId },
    });

    return { status: 'success', message: 'Group deleted successfully' };
  }

  async inviteStudent(groupId: string, instructorId: string, studentId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.instructorId !== instructorId) throw new ForbiddenException('Only the instructor can send invites');

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_groupId: { studentId, groupId } }
    });
    if (existingEnrollment) throw new ConflictException('Student is already enrolled');

    const existingInvite = await this.prisma.invitation.findUnique({
      where: { studentId_groupId: { studentId, groupId } }
    });

    if (existingInvite) {
      if (existingInvite.status === 'PENDING') throw new ConflictException('Invitation already pending');
      // If rejected/accepted previously, update it to pending
      await this.prisma.invitation.update({
        where: { id: existingInvite.id },
        data: { status: 'PENDING' }
      });
      return { status: 'success', message: 'Invitation sent' };
    }

    await this.prisma.invitation.create({
      data: { groupId, studentId, status: 'PENDING' }
    });
    return { status: 'success', message: 'Invitation sent' };
  }

  async undoInvitation(groupId: string, instructorId: string, studentId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.instructorId !== instructorId) throw new ForbiddenException('Not authorized');

    const invite = await this.prisma.invitation.findUnique({
      where: { studentId_groupId: { studentId, groupId } }
    });
    if (!invite || invite.status !== 'PENDING') throw new NotFoundException('No pending invitation found');

    await this.prisma.invitation.delete({ where: { id: invite.id } });
    return { status: 'success', message: 'Invitation undone' };
  }

  async getPendingInvitations(studentId: string) {
    const invites = await this.prisma.invitation.findMany({
      where: { studentId, status: 'PENDING' },
      include: {
        group: { select: { id: true, name: true, instructor: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { status: 'success', data: invites };
  }

  async acceptInvitation(invitationId: string, studentId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
      if (!invite || invite.studentId !== studentId || invite.status !== 'PENDING') {
        throw new NotFoundException('Invalid or expired invitation');
      }

      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' }
      });

      const enrollment = await prisma.enrollment.create({
        data: { studentId: invite.studentId, groupId: invite.groupId }
      });

      return { status: 'success', data: enrollment, message: 'Group joined successfully' };
    });
  }

  async rejectInvitation(invitationId: string, studentId: string) {
    const invite = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.studentId !== studentId || invite.status !== 'PENDING') {
      throw new NotFoundException('Invalid or expired invitation');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED' }
    });

    return { status: 'success', message: 'Invitation rejected' };
  }

  async removeStudent(groupId: string, instructorId: string, studentId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.instructorId !== instructorId) throw new ForbiddenException('Not authorized');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_groupId: { studentId, groupId } }
    });
    if (!enrollment) throw new NotFoundException('Student is not enrolled');

    await this.prisma.enrollment.delete({ where: { id: enrollment.id } });
    
    // Cleanup any invites
    await this.prisma.invitation.deleteMany({
      where: { studentId, groupId }
    });

    return { status: 'success', message: 'Student removed from group' };
  }
}
