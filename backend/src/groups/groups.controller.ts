import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '../user/guard/auth.guard';
import { Roles } from '../user/decorators/user.decorators';

@Controller('groups')
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(['INSTRUCTOR'])
  createGroup(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateGroupDto,
  ) {
    return this.groupsService.createGroup(req.user.id, dto);
  }

  @Get()
  @Roles(['INSTRUCTOR'])
  getGroups(@Req() req: any) {
    return this.groupsService.findAllByInstructor(req.user.id);
  }

  @Get('my-groups')
  @Roles(['STUDENT'])
  getStudentGroups(@Req() req: any) {
    return this.groupsService.findAllByStudent(req.user.id);
  }

  @Get(':id/members')
  @Roles(['INSTRUCTOR'])
  getGroupMembers(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getGroupMembers(id, req.user.id);
  }

  @Patch(':id')
  @Roles(['INSTRUCTOR'])
  updateGroup(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateGroupDto,
  ) {
    return this.groupsService.updateGroup(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles(['INSTRUCTOR'])
  deleteGroup(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.deleteGroup(id, req.user.id);
  }

  @Get('dashboard/data')
  @Roles(['INSTRUCTOR'])
  async getDashboardData(@Req() req: any) {
    const instructorId = req.user.id;
    const groups = await this.groupsService['prisma'].group.findMany({
      where: { instructorId },
      orderBy: { created_at: 'desc' },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                sessions: { select: { lastUsedAt: true }, orderBy: { lastUsedAt: 'desc' }, take: 1 },
                meetingParticipants: { where: { meeting: { hostId: instructorId } }, select: { avgEngagementScore: true, joinedAt: true } }
              }
            }
          }
        },
        invitations: {
          where: { status: 'PENDING' },
          select: { studentId: true }
        }
      }
    });
    return { status: 'success', data: groups };
  }

  @Get('dashboard/students')
  @Roles(['INSTRUCTOR', 'ADMIN'])
  async getAllStudents() {
    const students = await this.groupsService['prisma'].user.findMany({
      where: { role: 'STUDENT' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        avatarUrl: true,
        sessions: { select: { lastUsedAt: true }, orderBy: { lastUsedAt: 'desc' }, take: 1 }
      },
      orderBy: { name: 'asc' }
    });
    return { status: 'success', data: students };
  }

  @Post(':id/invitations')
  @Roles(['INSTRUCTOR'])
  inviteStudent(@Param('id') id: string, @Req() req: any, @Body() dto: { studentId: string }) {
    return this.groupsService.inviteStudent(id, req.user.id, dto.studentId);
  }

  @Delete(':id/invitations/:studentId')
  @Roles(['INSTRUCTOR'])
  undoInvitation(@Param('id') id: string, @Param('studentId') studentId: string, @Req() req: any) {
    return this.groupsService.undoInvitation(id, req.user.id, studentId);
  }

  @Get('invitations/pending')
  @Roles(['STUDENT'])
  getPendingInvitations(@Req() req: any) {
    return this.groupsService.getPendingInvitations(req.user.id);
  }

  @Post('invitations/:invitationId/accept')
  @Roles(['STUDENT'])
  acceptInvitation(@Param('invitationId') invitationId: string, @Req() req: any) {
    return this.groupsService.acceptInvitation(invitationId, req.user.id);
  }

  @Post('invitations/:invitationId/reject')
  @Roles(['STUDENT'])
  rejectInvitation(@Param('invitationId') invitationId: string, @Req() req: any) {
    return this.groupsService.rejectInvitation(invitationId, req.user.id);
  }

  @Delete(':id/students/:studentId')
  @Roles(['INSTRUCTOR'])
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @Req() req: any) {
    return this.groupsService.removeStudent(id, req.user.id, studentId);
  }
}
