import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalStudents, totalInstructors, totalMeetings] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', active: true } }),
      this.prisma.user.count({ where: { role: 'INSTRUCTOR', active: true } }),
      this.prisma.meeting.count(),
    ]);

    return {
      status: 'success',
      data: {
        totalStudents,
        totalInstructors,
        totalMeetings,
      },
    };
  }

  async getUsers(query: {
    search?: string;
    role?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      role: { not: 'ADMIN' },
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      const validRoles = ['INSTRUCTOR', 'STUDENT'];
      if (validRoles.includes(query.role.toUpperCase())) {
        where.role = query.role.toUpperCase();
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          isProfileComplete: true,
          created_at: true,
        },
        orderBy: { created_at: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      status: 'success',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async updateUserRole(
    userId: string,
    newRole: string,
    requestingAdminId: string,
  ) {
    const validRoles = ['INSTRUCTOR', 'STUDENT', 'ADMIN'];
    const role = newRole.toUpperCase();

    if (!validRoles.includes(role)) {
      throw new ForbiddenException(`Invalid role: ${newRole}`);
    }

    if (userId === requestingAdminId && role !== 'ADMIN') {
      throw new ForbiddenException('Cannot change your own admin role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Role-Switching Architecture Protection (Hard Block Strategy)
    if (user.role === 'INSTRUCTOR' && role === 'STUDENT') {
      const activeGroups = await this.prisma.group.count({
        where: { instructorId: userId },
      });

      if (activeGroups > 0) {
        throw new BadRequestException(
          'Cannot downgrade: User owns active groups. Delete or reassign them first.',
        );
      }
    }

    if (user.role === 'STUDENT' && role === 'INSTRUCTOR') {
      const activeEnrollments = await this.prisma.enrollment.count({
        where: { studentId: userId },
      });

      if (activeEnrollments > 0) {
        throw new BadRequestException(
          'Cannot upgrade: User is currently enrolled in groups. Remove enrollments first.',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return {
      status: 'success',
      data: updated,
    };
  }

  async deleteUser(userId: string, requestingAdminId: string) {
    if (userId === requestingAdminId) {
      throw new ForbiddenException('Cannot delete your own admin account');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hard delete — permanently remove user from database
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }
}
