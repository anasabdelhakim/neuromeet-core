import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { AuthGuard } from '../user/guard/auth.guard';
import { Roles } from '../user/decorators/user.decorators';

export class InviteGroupDto {
  emails: string[];
}

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

  @Post('join')
  @Roles(['STUDENT'])
  joinGroup(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true })) dto: JoinGroupDto,
  ) {
    return this.groupsService.joinGroup(req.user.id, dto);
  }

  @Get(':id/members')
  @Roles(['INSTRUCTOR'])
  getGroupMembers(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getGroupMembers(id, req.user.id);
  }

  @Post(':id/invite')
  @Roles(['INSTRUCTOR'])
  inviteStudents(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: InviteGroupDto,
  ) {
    return this.groupsService.inviteStudents(id, req.user.id, dto.emails);
  }
}
