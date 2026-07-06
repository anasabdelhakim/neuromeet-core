import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { AuthGuard } from '../user/guard/auth.guard';
import { Roles } from '../user/decorators/user.decorators';
import {
  AddMaterialDto,
  CreateMeetingDto,
  JoinMeetingDto,
  UpdateMeetingDto,
  UpdateParticipantDto,
} from './dto/meeting.dto';

const ALL_ROLES = ['INSTRUCTOR', 'STUDENT', 'ADMIN'];

@Controller('meetings')
@Roles(ALL_ROLES)
@UseGuards(AuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // =========================
  // MEETINGS — CRUD
  // =========================

  @Post()
  createMeeting(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createMeeting(req.user.id, dto);
  }

  @Get()
  getAllMeetings(@Req() req: any) {
    return this.meetingsService.getAllMeetings(req.user.id);
  }

  @Get('upcoming')
  getUpcomingMeetings(@Req() req: any) {
    return this.meetingsService.getUpcomingMeetings(req.user.id);
  }

  @Get('today')
  getTodayMeetings(@Req() req: any) {
    return this.meetingsService.getTodayMeetings(req.user.id);
  }

  @Get('previous')
  getPreviousMeetings(@Req() req: any) {
    return this.meetingsService.getPreviousMeetings(req.user.id);
  }

  @Get('student/upcoming')
  getStudentUpcomingMeetings(@Req() req: any) {
    return this.meetingsService.getStudentUpcomingMeetings(req.user.id);
  }

  @Get('student/today')
  getStudentTodayMeetings(@Req() req: any) {
    return this.meetingsService.getStudentTodayMeetings(req.user.id);
  }

  @Get('student/previous')
  getStudentPreviousMeetings(@Req() req: any) {
    return this.meetingsService.getStudentPreviousMeetings(req.user.id);
  }

  @Get(':id')
  getMeetingById(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.getMeetingById(id, req.user.id);
  }

  @Patch(':id')
  updateMeeting(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateMeetingDto,
  ) {
    return this.meetingsService.updateMeeting(id, req.user.id, dto);
  }

  @Delete(':id')
  deleteMeeting(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.deleteMeeting(id, req.user.id);
  }

  @Post(':id/end')
  endMeeting(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.endMeeting(id, req.user.id);
  }

  @Post(':id/start')
  startMeeting(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.startMeeting(id, req.user.id);
  }

  @Post(':id/share')
  shareMeeting(
    @Param('id') id: string,
    @Req() req: any,
    @Body('groupId') groupId: string,
  ) {
    return this.meetingsService.shareMeeting(id, req.user.id, groupId);
  }

  // =========================
  // PARTICIPANTS
  // =========================

  @Post(':id/join')
  joinMeeting(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: JoinMeetingDto,
  ) {
    return this.meetingsService.joinMeeting(id, req.user.id, dto);
  }

  @Post(':id/leave')
  leaveMeeting(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.leaveMeeting(id, req.user.id);
  }

  @Get(':id/participants')
  getMeetingParticipants(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.getMeetingParticipants(id, req.user.id);
  }

  @Patch(':id/participants/:participantId')
  updateParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateParticipantDto,
  ) {
    return this.meetingsService.updateParticipant(
      id,
      participantId,
      req.user.id,
      dto,
    );
  }

  @Post(':id/sync-engagement')
  @Roles(['INSTRUCTOR', 'ADMIN'])
  syncEngagement(
    @Param('id') id: string,
    @Body() body: { stats: { participantIdentity: string; avgEngagementScore: number; adhdFlagged: boolean }[] }
  ) {
    return this.meetingsService.syncEngagement(id, body.stats);
  }

  // =========================
  // MATERIALS
  // =========================

  @Post(':id/materials')
  addMaterial(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: AddMaterialDto,
  ) {
    return this.meetingsService.addMaterial(id, req.user.id, dto);
  }

  @Get(':id/materials')
  getMeetingMaterials(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.getMeetingMaterials(id, req.user.id);
  }

  @Delete(':id/materials/:materialId')
  deleteMaterial(
    @Param('id') id: string,
    @Param('materialId') materialId: string,
    @Req() req: any,
  ) {
    return this.meetingsService.deleteMaterial(id, materialId, req.user.id);
  }
}
