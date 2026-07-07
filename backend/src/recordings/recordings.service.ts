import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
@Injectable()
export class RecordingsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllRecordings(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const whereClause = {
      recordedById: userId
    };
    const recordings = await this.prisma.recording.findMany({
      where: whereClause,
      include: {
        meeting: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
    const data = recordings.map((rec) => {
      let status = 'PROCESSING';
      if (rec.status === 'UPLOADED') status = 'COMPLETED';
      else if (rec.status === 'FAILED') status = 'FAILED';
      return {
        id: rec.id,
        meetingId: rec.meeting?.livekitRoomName || rec.meeting?.id || 'unknown',
        title: rec.meeting?.title || 'Meeting Recording',
        description: rec.meeting?.description || '',
        gDriveViewLink: rec.driveWebViewLink || 'https://drive.google.com/',
        gDriveDirectLink: rec.driveWebViewLink || 'https://drive.google.com/',
        duration: rec.duration || 0,
        status,
        createdAt: rec.uploadedAt.toISOString(),
        image: rec.r2Key || undefined,
        dateTime: rec.uploadedAt.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };
    });
    return { data };
  }
  async saveThumbnail(meetingId: string, thumbnail: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [
          { id: meetingId },
          { livekitRoomName: meetingId },
        ],
      },
    });
    if (meeting) {
      const recording = await this.prisma.recording.findFirst({
        where: {
          meetingId: meeting.id,
          recordedById: userId,
          status: 'PROCESSING',
        },
        orderBy: { uploadedAt: 'desc' }
      });
      if (recording) {
        await this.prisma.recording.update({
          where: { id: recording.id },
          data: { r2Key: thumbnail },
        });
      } else {
        const uploadingRecording = await this.prisma.recording.findFirst({
          where: {
            meetingId: meeting.id,
            recordedById: userId,
            status: 'UPLOADING',
          },
          orderBy: { uploadedAt: 'desc' }
        });
        if (uploadingRecording) {
          await this.prisma.recording.update({
            where: { id: uploadingRecording.id },
            data: { r2Key: thumbnail },
          });
        }
      }
    }
    return { success: true };
  }
  async deleteRecording(id: string, userId: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id },
      include: { meeting: true },
    });
    if (!recording) throw new NotFoundException('Recording not found');
    if (recording.meeting?.hostId !== userId && recording.recordedById !== userId) {
      throw new ForbiddenException('Only the host or the recording owner can delete this recording');
    }
    await this.prisma.recording.delete({
      where: { id },
    });
    return { status: 'success', message: 'Recording deleted successfully' };
  }
}
