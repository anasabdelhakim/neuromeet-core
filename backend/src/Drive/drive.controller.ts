import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { DriveService } from './drive.service';
import { CacheService } from '../utils/cache.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/current-user.decorator';
import { SkipThrottle } from '@nestjs/throttler';
@Controller('drive')
@UseGuards(AuthGuard)
@Roles(['INSTRUCTOR', 'STUDENT'])
export class DriveController {
  private readonly logger = new Logger(DriveController.name);
  constructor(
    private readonly driveService: DriveService,
    private readonly cacheService: CacheService,
  ) {}
  @Post('upload-material')
  @HttpCode(HttpStatus.CREATED)
  async uploadMaterial(@Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException(
        'No file found in request. Use form-data with a "file" field.',
      );
    }
    const buffer = await file.toBuffer();
    if (buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty.');
    }
    this.logger.log(
      `📎 Material upload: ${file.filename} (${file.mimetype}) ` +
        `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
    );
    const result = await this.driveService.uploadFile({
      originalname: file.filename,
      mimetype: file.mimetype,
      buffer,
    });
    return {
      message: 'Material uploaded successfully',
      fileId: result.fileId,
      webViewLink: result.webViewLink,
    };
  }
  @Post('recording/stream/:meetingId')
  @HttpCode(HttpStatus.OK)
  async streamRecording(
    @Param('meetingId') meetingId: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    if (!meetingId || meetingId.trim() === '') {
      throw new BadRequestException('meetingId parameter is required');
    }
    const contentType = req.headers['content-type'] || 'video/webm';
    if (
      !contentType.includes('video/') &&
      !contentType.includes('application/octet-stream')
    ) {
      throw new BadRequestException(
        `Invalid Content-Type: ${contentType}. Expected video/* or application/octet-stream`,
      );
    }
    this.logger.log(
      `🎬 Recording stream started for meeting: ${meetingId} | Content-Type: ${contentType}`,
    );
    const rawStream = req.raw as NodeJS.ReadableStream;
    const uploadSessionKey = `recording:session:${meetingId}`;
    const query = req.query as any;
    const duration = parseInt(query.duration || '0', 10);
    try {
      const result = await this.driveService.streamRecordingToDrive(
        meetingId,
        rawStream,
        duration,
        contentType.split(';')[0].trim(), // strip charset if present
      );
      await this.cacheService.del(uploadSessionKey);
      this.logger.log(
        `✅ Recording stream complete for meeting ${meetingId}: ` +
          `fileId=${result.fileId}, ` +
          `size=${(result.totalBytes / 1024 / 1024).toFixed(1)} MB, ` +
          `chunks=${result.chunksUploaded}, ` +
          `time=${Math.round(result.durationMs / 1000)}s`,
      );
      return reply.code(200).send({
        message: 'Recording uploaded to Google Drive successfully',
        meetingId,
        fileId: result.fileId,
        webViewLink: result.webViewLink,
        webContentLink: result.webContentLink,
        stats: {
          totalBytes: result.totalBytes,
          totalMB: parseFloat((result.totalBytes / 1024 / 1024).toFixed(2)),
          chunksUploaded: result.chunksUploaded,
          durationSeconds: Math.round(result.durationMs / 1000),
          avgSpeedMBps: parseFloat(
            (
              result.totalBytes /
              1024 /
              1024 /
              (result.durationMs / 1000)
            ).toFixed(2),
          ),
        },
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Recording stream failed for meeting ${meetingId}:`,
        error.stack || error.message,
      );
      this.cacheService.events.emit(
        `recording:events:${meetingId}`,
        JSON.stringify({
          meetingId,
          status: 'error',
          message: 'Internal recording error',
        }),
      );
      return reply.code(500).send({
        error: 'Recording upload failed',
        meetingId,
        reason: 'Internal server error',
      });
    }
  }
  @Post('recording/init/:meetingId')
  @HttpCode(HttpStatus.OK)
  async initRecordingUpload(
    @Param('meetingId') meetingId: string,
    @Req() req: any,
  ) {
    if (!meetingId || meetingId.trim() === '') {
      throw new BadRequestException('meetingId parameter is required');
    }
    return this.driveService.initResumableUpload(meetingId, req.user.id);
  }
  @Post('recording/chunk/:meetingId')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async uploadRecordingChunk(
    @Param('meetingId') meetingId: string,
    @Req() req: any,
  ) {
    const query = req.query as any;
    const uploadUrl = query.uploadUrl as string;
    const byteOffset = parseInt(query.byteOffset || '0', 10);
    const totalSizeStr = query.totalSize || '*';
    const totalSize = totalSizeStr === '*' ? '*' : parseInt(totalSizeStr, 10);
    const isFinal = query.isFinal === 'true';
    const duration = parseInt(query.duration || '0', 10);
    if (!uploadUrl) {
      throw new BadRequestException('uploadUrl query parameter is required');
    }
    const chunkBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.raw.on('data', (chunk) =>
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
      );
      req.raw.on('end', () => resolve(Buffer.concat(chunks)));
      req.raw.on('error', reject);
    });
    const result = await this.driveService.uploadChunkToDrive(
      uploadUrl,
      chunkBuffer,
      byteOffset,
      totalSize,
      isFinal,
      meetingId,
      duration,
      req.user.id,
    );
    return result;
  }
  @Get('recording/progress/:meetingId')
  async recordingProgress(
    @Param('meetingId') meetingId: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const channel = `recording:events:${meetingId}`;
    const progressKey = `recording:progress:${meetingId}`;
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disables Nginx buffering (important for SSE)
      'Access-Control-Allow-Origin':
        process.env.FRONTEND_URL || 'http://localhost:3000',
    });
    const existing = await this.cacheService.get(progressKey);
    if (existing) {
      reply.raw.write(`data: ${JSON.stringify(existing)}\n\n`);
    } else {
      reply.raw.write(
        `data: ${JSON.stringify({ meetingId, status: 'waiting', message: 'Waiting for recording stream...' })}\n\n`,
      );
    }
    let isConnectionAlive = true;
    const keepAlive = setInterval(() => {
      if (isConnectionAlive) {
        reply.raw.write(': keepalive\n\n');
      }
    }, 25_000);
    const onMessage = (message: string) => {
      if (!isConnectionAlive) return;
      reply.raw.write(`data: ${message}\n\n`);
      try {
        const parsed = JSON.parse(message);
        if (parsed.status === 'complete' || parsed.status === 'error') {
          cleanup();
        }
      } catch {}
    };
    this.cacheService.events.on(channel, onMessage);
    const cleanup = () => {
      if (!isConnectionAlive) return;
      isConnectionAlive = false;
      clearInterval(keepAlive);
      this.cacheService.events.removeListener(channel, onMessage);
      if (!reply.raw.writableEnded) {
        reply.raw.end();
      }
    };
    req.raw.on('close', cleanup);
    req.raw.on('end', cleanup);
  }
  @Get('recording/status/:meetingId')
  async recordingStatus(@Param('meetingId') meetingId: string) {
    const key = `recording:progress:${meetingId}`;
    const data = await this.cacheService.get(key);
    if (!data) {
      return {
        meetingId,
        status: 'not_found',
        message: 'No recording progress found for this meeting',
      };
    }
    return data;
  }
}
