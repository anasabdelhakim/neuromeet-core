import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInstructorMeetings(instructorId: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: { hostId: instructorId, status: 'ENDED' },
      select: {
        id: true,
        title: true,
        startedAt: true,
      },
      orderBy: { startedAt: 'desc' }
    });
    return meetings;
  }

  async getMeetingAnalytics(meetingId: string, instructorId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: meetingId, hostId: instructorId, status: 'ENDED' },
      include: {
        participants: {
          include: { user: true }
        }
      }
    });

    if (!meeting) return null;

    let totalEngagementSum = 0;
    let totalParticipantsCount = 0;
    let totalAdhdFlags = 0;
    let totalSeconds = 0;

    const studentMatrix: any[] = [];

    meeting.participants.forEach(p => {
      if (p.userId === instructorId) return;

      if (p.avgEngagementScore !== null) {
        totalEngagementSum += p.avgEngagementScore;
        totalParticipantsCount++;
      }
      if (p.adhdFlagged) {
        totalAdhdFlags++;
      }
      totalSeconds += p.secondsPresent;

      studentMatrix.push({
        name: p.user.name,
        avgEngagement: p.avgEngagementScore || 0,
        totalSeconds: p.secondsPresent,
        adhdFlags: p.adhdFlagged ? 1 : 0
      });
    });

    const avgEngagement = totalParticipantsCount > 0 ? (totalEngagementSum / totalParticipantsCount) : 0;

    return {
      kpis: {
        totalParticipants: studentMatrix.length,
        avgEngagement,
        totalAdhdFlags,
        totalHours: (totalSeconds / 3600).toFixed(1)
      },
      studentMatrix
    };
  }

  async getStudentAnalytics(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true }
    });

    const participations = await this.prisma.meetingParticipant.findMany({
      where: { userId: studentId, meeting: { status: 'ENDED' } },
      include: { meeting: true },
      orderBy: { meeting: { startedAt: 'asc' } }
    });

    let totalSeconds = 0;
    let engagementSum = 0;
    let engagementCount = 0;
    let totalAdhdFlags = 0;

    const timeline: any[] = [];

    participations.forEach(p => {
      totalSeconds += p.secondsPresent;
      if (p.avgEngagementScore !== null) {
        engagementSum += p.avgEngagementScore;
        engagementCount++;
      }
      if (p.adhdFlagged) totalAdhdFlags++;

      timeline.push({
        meetingId: p.meetingId,
        title: p.meeting.title,
        date: p.meeting.startedAt,
        engagement: p.avgEngagementScore || 0
      });
    });

    const avgEngagement = engagementCount > 0 ? (engagementSum / engagementCount) : 0;

    return {
      studentName: student?.name || "Unknown Student",
      kpis: {
        totalHours: (totalSeconds / 3600).toFixed(1),
        avgEngagement,
        totalAdhdFlags
      },
      timeline
    };
  }
}
