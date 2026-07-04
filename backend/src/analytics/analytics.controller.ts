import { Controller, Get, Req, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../user/guard/auth.guard';
import { Roles } from '../user/decorators/user.decorators';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('meetings')
  @Roles(['INSTRUCTOR', 'ADMIN'])
  getInstructorMeetings(@Req() req: any) {
    return this.analyticsService.getInstructorMeetings(req.user.id);
  }

  @Get('meeting/:meetingId')
  @Roles(['INSTRUCTOR', 'ADMIN'])
  getMeetingAnalytics(@Req() req: any, @Param('meetingId') meetingId: string) {
    return this.analyticsService.getMeetingAnalytics(meetingId, req.user.id);
  }

  @Get('student/:studentId')
  @Roles(['INSTRUCTOR', 'ADMIN'])
  getStudentAnalytics(@Param('studentId') studentId: string) {
    return this.analyticsService.getStudentAnalytics(studentId);
  }
}
