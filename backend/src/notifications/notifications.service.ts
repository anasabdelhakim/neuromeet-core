import { Injectable, Logger } from '@nestjs/common';
import { NotifType } from '../../lib/prisma/_generated';
import { PrismaService } from 'src/database/database.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  actionUrl?: string;
  sendEmail?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        actionUrl: dto.actionUrl,
      },
    });

    if (dto.sendEmail) {

      this.dispatchEmail(dto).catch(e => {
         this.logger.error(`Error in async email dispatch: ${e.message}`);
      });
    }

    return notification;
  }

  private async dispatchEmail(dto: CreateNotificationDto) {
    try {
      const user = await this.prisma.user.findUnique({ 
        where: { id: dto.userId }, 
        select: { email: true, name: true } 
      });
      if (!user) return;

      this.logger.log(`[EMAIL DISPATCH] To: ${user.email} | Subject: ${dto.title}`);
    } catch (e) {
      this.logger.error(`Failed to dispatch email to user ${dto.userId}`, e);
    }
  }

  async getUserNotifications(userId: string) {
    const data = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
      take: 50, // Keep it lightweight
    });
    return { status: 'success', data };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { status: 'success', count };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    return { status: 'success' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { status: 'success' };
  }
}
