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

@Controller('drive')
export class DriveController {
  private readonly logger = new Logger(DriveController.name);

  constructor(
    private readonly driveService: DriveService,
    private readonly cacheService: CacheService,
  ) {}

  // ── GET /api/v1/drive/test ───────────────────────────────────────────────
  // Verifies Drive connection and returns quota info
  @Get('test')
  async testConnection() {
    return this.driveService.testConnection();
  }

  // ── POST /api/v1/drive/upload-material ───────────────────────────────────
  // For regular file uploads: slides, PDFs, images (≤ 500 MB)
  // Uses multipart — file lands in RAM then streams to Drive
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

  // ── POST /api/v1/drive/recording/stream/:meetingId ───────────────────────
  //
  // THIS is the main recording endpoint — called by LiveKit Egress.
  //
  // How it works:
  //   1. LiveKit Egress POSTs raw video bytes here (no multipart, no JSON)
  //   2. We read the raw Fastify request as a Node.js stream
  //   3. DriveService pipes it in 10 MB chunks to Google Drive
  //   4. Progress is published to Cache → SSE → instructor dashboard
  //   5. When stream ends, we return the Drive file metadata
  //
  // Why raw stream and not multipart?
  //   - LiveKit Egress doesn't send multipart — it's a raw binary stream
  //   - Multipart would buffer the entire file in RAM before uploading
  //   - Raw streaming keeps RAM usage at ~10 MB regardless of file size
  //
  // Content-Type must be: video/webm (or video/mp4 depending on your Egress config)
  //
  //
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

    // Validate content-type — must be a video stream from LiveKit
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

    // Read the raw Node.js stream from the Fastify request.
    // req.raw is the underlying IncomingMessage — it's a Readable stream.
    // This is the KEY difference from multipart: we never call req.file()
    // or req.body because those would buffer everything into RAM.
    const rawStream = req.raw as NodeJS.ReadableStream;

    // Optional: store the Drive upload URL in Cache for crash recovery
    // If the NestJS server crashes mid-upload, you can call
    // driveService.getResumeOffset(storedUrl) and resume from there.
    const uploadSessionKey = `recording:session:${meetingId}`;

    const query = req.query as any;
    const duration = parseInt(query.duration || '0', 10);

    try {
      // This call does NOT return until the entire stream is uploaded.
      // The connection stays open the whole time — that's expected.
      // Fastify keepAliveTimeout in main.ts is set to 620s for this reason.
      const result = await this.driveService.streamRecordingToDrive(
        meetingId,
        rawStream,
        duration,
        contentType.split(';')[0].trim(), // strip charset if present
      );

      // Clean up Cache session key
      await this.cacheService.del(uploadSessionKey);

      this.logger.log(
        `✅ Recording stream complete for meeting ${meetingId}: ` +
          `fileId=${result.fileId}, ` +
          `size=${(result.totalBytes / 1024 / 1024).toFixed(1)} MB, ` +
          `chunks=${result.chunksUploaded}, ` +
          `time=${Math.round(result.durationMs / 1000)}s`,
      );

      // Return the result immediately — NestJS will close the response
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
        error.message,
      );

      // Publish error to Cache so frontend knows the upload failed
      this.cacheService.events.emit(
        `recording:events:${meetingId}`,
        JSON.stringify({
          meetingId,
          status: 'error',
          message: error.message,
        }),
      );

      return reply.code(500).send({
        error: 'Recording upload failed',
        meetingId,
        reason: error.message,
      });
    }
  }

  // ── POST /api/v1/drive/recording/init/:meetingId ─────────────────────────
  @Post('recording/init/:meetingId')
  @HttpCode(HttpStatus.OK)
  async initRecordingUpload(@Param('meetingId') meetingId: string) {
    if (!meetingId || meetingId.trim() === '') {
      throw new BadRequestException('meetingId parameter is required');
    }
    return this.driveService.initResumableUpload(meetingId);
  }

  // ── PUT /api/v1/drive/recording/chunk/:meetingId ─────────────────────────
  @Post('recording/chunk/:meetingId')
  @HttpCode(HttpStatus.OK)
  async uploadRecordingChunk(
    @Param('meetingId') meetingId: string,
    @Req() req: FastifyRequest,
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
      req.raw.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
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
    );

    return result;
  }

  // ── GET /api/v1/drive/recording/progress/:meetingId ──────────────────────
  //
  // Server-Sent Events (SSE) endpoint.
  // The instructor dashboard connects here and receives live upload progress.
  //
  // How it works:
  //   1. Client opens this endpoint — connection stays open
  //   2. We subscribe to Cache events for recording:events:{meetingId}
  //   3. Every time DriveService publishes progress, we forward it as SSE
  //   4. When status=complete or status=error, we close the connection
  //
  // The instructor dashboard uses this to show:
  //   "Recording uploading... 1.2 GB / unknown"
  //   "Recording complete: 4.3 GB in 8 minutes"
  //
  @Get('recording/progress/:meetingId')
  async recordingProgress(
    @Param('meetingId') meetingId: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const channel = `recording:events:${meetingId}`;
    const progressKey = `recording:progress:${meetingId}`;

    // SSE headers — must be set before any data is written
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disables Nginx buffering (important for SSE)
      'Access-Control-Allow-Origin':
        process.env.FRONTEND_URL || 'http://localhost:3000',
    });

    // Send any existing progress immediately on connect (catch-up)
    const existing = await this.cacheService.get(progressKey);
    if (existing) {
      reply.raw.write(`data: ${JSON.stringify(existing)}\n\n`);
    } else {
      // Let the client know we're connected and waiting
      reply.raw.write(
        `data: ${JSON.stringify({ meetingId, status: 'waiting', message: 'Waiting for recording stream...' })}\n\n`,
      );
    }

    let isConnectionAlive = true;

    // Keep-alive ping every 25 seconds to prevent proxy timeouts
    const keepAlive = setInterval(() => {
      if (isConnectionAlive) {
        reply.raw.write(': keepalive\n\n');
      }
    }, 25_000);

    const onMessage = (message: string) => {
      if (!isConnectionAlive) return;

      reply.raw.write(`data: ${message}\n\n`);

      // Close SSE when upload is done or failed
      try {
        const parsed = JSON.parse(message);
        if (parsed.status === 'complete' || parsed.status === 'error') {
          cleanup();
        }
      } catch {
        // not JSON — ignore
      }
    };

    // Subscribe to the EventEmitter channel
    this.cacheService.events.on(channel, onMessage);

    // Cleanup function — called on client disconnect or upload complete
    const cleanup = () => {
      if (!isConnectionAlive) return;
      isConnectionAlive = false;
      clearInterval(keepAlive);
      this.cacheService.events.removeListener(channel, onMessage);
      if (!reply.raw.writableEnded) {
        reply.raw.end();
      }
    };

    // Handle client disconnect (browser tab closed, navigation, etc.)
    req.raw.on('close', cleanup);
    req.raw.on('end', cleanup);
  }

  // ── GET /api/v1/drive/recording/status/:meetingId ────────────────────────
  // One-shot status check (for polling fallback if SSE is unavailable)
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