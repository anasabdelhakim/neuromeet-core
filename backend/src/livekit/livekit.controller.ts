import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('token')
  getToken(@Query('room') room: string, @Query('user') user: string) {
    return {
      token: this.livekitService.createToken(room, user),
    };
  }}