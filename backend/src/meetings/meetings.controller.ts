import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { AuthGuard } from '../user/guard/auth.guard';
import { Roles } from '../user/decorators/user.decorators';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meetings')
@UseGuards(AuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post('instant')
  @Roles(['INSTRUCTOR'])
  createInstantMeeting(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createInstantMeeting(req.user.id, dto);
  }

  @Post('schedule')
  @Roles(['INSTRUCTOR'])
  scheduleMeeting(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateMeetingDto,
  ) {
    return this.meetingsService.scheduleMeeting(req.user.id, dto);
  }

  @Get('upcoming')
  @Roles(['INSTRUCTOR'])
  getUpcomingMeetings(@Req() req: any, @Query('cursor') cursor?: string) {
    return this.meetingsService.getUpcomingMeetings(req.user.id, cursor);
  }

  @Get('previous')
  @Roles(['INSTRUCTOR'])
  getPreviousMeetings(@Req() req: any, @Query('cursor') cursor?: string) {
    return this.meetingsService.getPreviousMeetings(req.user.id, cursor);
  }

  @Get('today')
  @Roles(['INSTRUCTOR'])
  getTodayMeetings(@Req() req: any) {
    return this.meetingsService.getTodayMeetings(req.user.id);
  }

  @Patch(':id')
  @Roles(['INSTRUCTOR'])
  updateMeeting(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateMeetingDto,
  ) {
    return this.meetingsService.updateMeeting(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(['INSTRUCTOR'])
  cancelMeeting(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.cancelMeeting(id, req.user.id);
  }

  @Post('join/:code')
  @Roles(['STUDENT', 'INSTRUCTOR'])
  joinMeetingByCode(@Param('code') code: string, @Req() req: any) {
    return this.meetingsService.joinMeetingByCode(code, req.user.id, req.user.role);
  }

  @Get('student/upcoming')
  @Roles(['STUDENT'])
  getStudentUpcomingMeetings(@Req() req: any) {
    return this.meetingsService.getStudentUpcomingMeetings(req.user.id);
  }

  @Get('student/today')
  @Roles(['STUDENT'])
  getStudentTodayMeetings(@Req() req: any) {
    return this.meetingsService.getStudentTodayMeetings(req.user.id);
  }
}
