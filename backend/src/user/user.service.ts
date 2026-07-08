import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/database.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getMe(payload: { id: string }) {
    if (!payload.id) throw new NotFoundException('user not found');
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
        avatarUrl: true,
        isProfileComplete: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');
    return {
      status: 'success',
      data: { user },
    };
  }
  async updateMe(payload: { id: string }, updateUserDto: UpdateUserDto) {
    if (!payload.id) throw new NotFoundException('user not found');
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) throw new NotFoundException('user not found');
    const updatedUser = await this.prisma.user.update({
      where: { id: payload.id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        avatarUrl: true,
        isProfileComplete: true,
      },
    });
    return {
      status: 'success',
      data: updatedUser,
    };
  }
  async deleteMe(payload: { id: string }): Promise<void> {
    if (!payload.id) throw new NotFoundException('user not found');
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) throw new NotFoundException('user not found');
    await this.prisma.user.delete({
      where: { id: payload.id },
    });
  }
}
