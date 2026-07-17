import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/current-user.decorator';
const ALL_ROLES = ['INSTRUCTOR', 'STUDENT', 'ADMIN'];
@Controller('recordings')
@Roles(ALL_ROLES)
@UseGuards(AuthGuard)
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}
  @Get()
  getAllRecordings(@Req() req: any) {
    return this.recordingsService.getAllRecordings(req.user.id);
  }
  @Post(':meetingId/thumbnail')
  async saveThumbnail(
    @Param('meetingId') meetingId: string,
    @Body() body: { thumbnail: string },
    @Req() req: any,
  ) {
    return this.recordingsService.saveThumbnail(
      meetingId,
      body.thumbnail,
      req.user.id,
    );
  }
  @Delete(':id')
  deleteRecording(@Param('id') id: string, @Req() req: any) {
    return this.recordingsService.deleteRecording(id, req.user.id);
  }
}
