import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import * as https from 'https';
import { CacheService } from '../utils/cache.service';
import { PrismaService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotifType } from '../../lib/prisma/_generated';

// ─── HTTPS Keep-Alive Pool ────────────────────────────────────────────────────
// Reuses TCP connections to googleapis.com across all chunk PUT requests.
// Without this, every chunk pays ~100-200ms for a new TLS handshake.
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 8,   // 1 active upload + headroom for session init & other calls
  maxFreeSockets: 4,
  scheduling: 'fifo',
} as any);

// ─── Tuning ───────────────────────────────────────────────────────────────────

// Drive resumable upload: minimum chunk = 256 KB, must be multiple of 256 KB.
// 50 MB is a highly optimized balance for modern connections.
// It cuts the number of HTTP round-trips by 5x compared to 10MB.
const CHUNK_SIZE_BYTES = 30 * 1024 * 1024; // 50 MB

// Publish progress to cache at most once per 10 MB to keep the hot path lean.
const PROGRESS_INTERVAL_BYTES = 10 * 1024 * 1024; // 10 MB

// Retry config for transient Drive errors (503, 429, network blips).
// Delays: 1s → 2s → 4s. After 3 retries the upload fails.
const MAX_CHUNK_RETRIES = 3;
const RETRY_BASE_MS = 1_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadFileData {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export interface RecordingUploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
  totalBytes: number;
  chunksUploaded: number;
  durationMs: number;
}

export interface UploadProgress {
  meetingId: string;
  bytesUploaded: number;
  totalBytes: number | null; // null = streaming (total unknown)
  chunksUploaded: number;
  status: 'streaming' | 'finalizing' | 'complete' | 'error';
  message: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class DriveService implements OnModuleInit {
  private readonly logger = new Logger(DriveService.name);
  private drive: drive_v3.Drive;
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;

  // Token cache — avoids an OAuth round-trip (~300 ms) on every upload.
  // Invalidated 60 s before expiry so we never hit Drive with a stale token.
  private _cachedToken: string | null = null;
  private _tokenExpiresAt = 0;

  constructor(
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onModuleInit() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        'https://developers.google.com/oauthplayground',
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Keep in-memory cache in sync when the library auto-refreshes
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.access_token) {
        this._cachedToken = tokens.access_token;
        this._tokenExpiresAt = tokens.expiry_date
          ? tokens.expiry_date - 60_000
          : Date.now() + 55 * 60 * 1000;
      }
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    this.logger.log('✅ DriveService initialized');
  }

  // ── Public: Small file upload (slides, PDFs, images ≤ 500 MB) ────────────

  async uploadFile(
    fileData: UploadFileData,
    folderId?: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!;

    this.logger.log(
      `📤 Uploading: ${fileData.originalname} (${fmt(fileData.buffer.length)})`,
    );

    const response = await this.drive.files.create({
      requestBody: { name: fileData.originalname, parents: [targetFolder] },
      media: { mimeType: fileData.mimetype, body: Readable.from(fileData.buffer) },
      fields: 'id, webViewLink',
    });

    this.logger.log(`✅ Uploaded: ${response.data.id}`);

    return {
      fileId: response.data.id!,
      webViewLink: response.data.webViewLink!,
    };
  }

  // ── Public: Large recording stream upload ────────────────────────────────
  // Existing stream method preserved for backward compatibility
  async streamRecordingToDrive(
    meetingId: string,
    rawStream: NodeJS.ReadableStream,
    recordingDurationSeconds: number,
    mimeType: string = 'video/webm',
    folderId?: string,
  ): Promise<RecordingUploadResult> {
    const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const { uploadUrl, meeting, fileName, startTime } = await this.initResumableUpload(
      meetingId, mimeType, targetFolder
    );

    this.logger.log(`🔗 Stream session opened: ${fileName}`);

    try {

      const result = await this._pipeStream(meetingId, rawStream, uploadUrl, mimeType);
      const durationMs = Date.now() - startTime;
      const speedMBps = (result.totalBytes / 1024 / 1024 / (durationMs / 1000)).toFixed(1);

      this.logger.log(
        `✅ Upload complete: ${fmt(result.totalBytes)} in ${Math.round(durationMs / 1000)}s @ ${speedMBps} MB/s`,
      );

      // Fix 403 Error: Make the file viewable by anyone with the link
      try {
        await this.drive.permissions.create({
          fileId: result.fileId,
          requestBody: { role: 'reader', type: 'anyone' },
        });
        this.logger.log(`🔓 Granted public read permission to file ${result.fileId}`);
      } catch (permError) {
        this.logger.warn(`Failed to set permissions for ${result.fileId}: ${permError}`);
      }

      if (meeting) {
        const recording = await this.prisma.recording.findFirst({
          where: { meetingId: meeting.id, status: 'UPLOADING' },
          orderBy: { uploadedAt: 'desc' }
        });
        if (recording) {
          await this.prisma.recording.update({
            where: { id: recording.id },
            data: {
              status: 'UPLOADED',
              driveFileId: result.fileId,
              driveWebViewLink: result.webViewLink,
              sizeBytes: result.totalBytes,
              duration: recordingDurationSeconds > 0 ? recordingDurationSeconds : Math.round(durationMs / 1000),
            },
          });
        }
      }

      // Fire-and-forget — don't block the return on Cache
      this._publishProgress({
        meetingId,
        bytesUploaded: result.totalBytes,
        totalBytes: result.totalBytes,
        chunksUploaded: result.chunksUploaded,
        status: 'complete',
        message: `Upload complete: ${fmt(result.totalBytes)} @ ${speedMBps} MB/s`,
      }).catch(() => {});

      return { ...result, durationMs };
    } catch (error) {
      if (meeting) {
        const recording = await this.prisma.recording.findFirst({
          where: { meetingId: meeting.id, status: 'UPLOADING' },
          orderBy: { uploadedAt: 'desc' }
        });
        if (recording) {
          await this.prisma.recording.update({
            where: { id: recording.id },
            data: { status: 'FAILED' },
          }).catch(() => {});
        }
      }
      throw error;
    }
  }

  // ── Public: Direct Resumable Chunking ────────────────────────────────────

  async initResumableUpload(
    meetingId: string,
    userId: string,
    mimeType: string = 'video/webm',
    folderId?: string,
  ) {
    const startTime = Date.now();
    const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const fileName = `recording-${meetingId}-${startTime}.webm`;

    let meeting = await this.prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingId }, { livekitRoomName: meetingId }],
      },
    });

    if (!meeting) {
      const instructor = await this.prisma.user.findFirst({
        where: { role: 'INSTRUCTOR' },
      });
      if (instructor) {
        meeting = await this.prisma.meeting.create({
          data: {
            title: `LiveKit Room: ${meetingId}`,
            livekitRoomName: meetingId,
            hostId: instructor.id,
            status: 'LIVE',
          },
        });
      }
    }

    if (meeting) {
      await this.prisma.recording.create({
        data: {
          meetingId: meeting.id,
          fileName,
          status: 'UPLOADING',
          recordedById: userId,
        },
      });
    }

    const accessToken = await this._getAccessToken();
    const uploadUrl = await this._initResumableSession(
      fileName,
      mimeType,
      targetFolder,
      accessToken,
    );

    return { uploadUrl, meeting, fileName, startTime };
  }

  async uploadChunkToDrive(
    uploadUrl: string,
    chunkBuffer: Buffer,
    byteOffset: number,
    totalSize: number | '*',
    isFinal: boolean,
    meetingId: string,
    recordingDurationSeconds: number,
    userId: string,
  ) {
    const parsedUrl = new URL(uploadUrl);
    const urlPath = parsedUrl.pathname + parsedUrl.search;

    const result = await this._putChunkWithRetry(
      parsedUrl.hostname,
      urlPath,
      chunkBuffer,
      byteOffset,
      totalSize,
      'video/webm',
      isFinal,
    );

    // If final, update permissions and database
    if (isFinal && result.fileId) {
      try {
        await this.drive.permissions.create({
          fileId: result.fileId,
          requestBody: { role: 'reader', type: 'anyone' },
        });
        this.logger.log(`🔓 Granted public read permission to file ${result.fileId}`);
      } catch (e) {
        this.logger.warn(`Failed to set permissions for ${result.fileId}: ${e}`);
      }

      const meeting = await this.prisma.meeting.findFirst({
        where: { OR: [{ id: meetingId }, { livekitRoomName: meetingId }] },
      });

      if (meeting) {
        const recording = await this.prisma.recording.findFirst({
          where: {
            meetingId: meeting.id,
            recordedById: userId,
            status: 'UPLOADING',
          },
          orderBy: { uploadedAt: 'desc' },
        });

        if (recording) {
          await this.prisma.recording.update({
            where: { id: recording.id },
            data: {
              status: 'UPLOADED',
              driveFileId: result.fileId,
              driveWebViewLink: result.webViewLink,
              sizeBytes: totalSize === '*' ? 0 : totalSize,
              duration: recordingDurationSeconds,
            },
          });
        }
      }

      this._publishProgress({
        meetingId,
        bytesUploaded: totalSize === '*' ? byteOffset + chunkBuffer.length : totalSize,
        totalBytes: totalSize === '*' ? null : totalSize,
        chunksUploaded: -1,
        status: 'complete',
        message: `Upload complete!`,
      }).catch(() => {});

      // Fire notification to the meeting participants
      if (meeting) {
        this.prisma.meetingParticipant.findMany({
          where: { meetingId: meeting.id },
          select: { userId: true },
        }).then(participants => {
          participants.forEach(p => {
            this.notificationsService.createNotification({
              userId: p.userId,
              type: NotifType.RECORDING_READY,
              title: 'Recording Available',
              body: `The recording for "${meeting.title}" is now available to watch.`,
              actionUrl: `/dashboard-student/recordings`,
              sendEmail: false, // In-app only
            }).catch(e => this.logger.error(`Failed to send recording notification: ${e}`));
          });
        });
      }
    }

    return result;
  }

  // ── Private: Token cache ──────────────────────────────────────────────────

  private async _getAccessToken(): Promise<string> {
    if (this._cachedToken && Date.now() < this._tokenExpiresAt) {
      return this._cachedToken;
    }
    const { token, res } = await this.oauth2Client.getAccessToken();
    if (!token) throw new Error('Failed to obtain Drive access token');
    this._cachedToken = token;
    const expiry = (res?.data as any)?.expiry_date;
    this._tokenExpiresAt = expiry ? expiry - 60_000 : Date.now() + 55 * 60 * 1000;
    return token;
  }

  // ── Private: Open a Drive resumable session ───────────────────────────────

  private _initResumableSession(
    fileName: string,
    mimeType: string,
    folderId: string,
    accessToken: string,
  ): Promise<string> {
    const body = JSON.stringify({ name: fileName, parents: [folderId], mimeType });
    const bodyLen = Buffer.byteLength(body);

    return new Promise<string>((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'www.googleapis.com',
          path: '/upload/drive/v3/files?uploadType=resumable',
          method: 'POST',
          agent: httpsAgent,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': bodyLen,
            'X-Upload-Content-Type': mimeType,
            // No X-Upload-Content-Length — we don't know size for a live stream
          },
        } as https.RequestOptions,
        (res) => {
          res.resume(); // drain body → socket returns to pool immediately
          if (res.statusCode !== 200) {
            return reject(new Error(`Session init failed: HTTP ${res.statusCode}`));
          }
          const location = res.headers['location'];
          if (!location) return reject(new Error('Drive did not return Location header'));
          resolve(location as string);
        },
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  // ── Private: Sequential chunk pipeline ───────────────────────────────────
  //
  // WHY sequential and not parallel:
  //   Google Drive's resumable upload API is a strict sequential protocol.
  //   Each PUT must contain Content-Range: bytes START-END/TOTAL|*
  //   where START = exactly the byte after Drive's last confirmed byte.
  //   Sending chunk N+1 before chunk N is ACKed results in HTTP 503:
  //   "upload offset exceeds already uploaded size".
  //
  // HOW we maximize speed within that constraint:
  //   • Reuse TLS connections via keepAlive agent (saves ~200ms/chunk)
  //   • Cache OAuth token (saves ~300ms per upload)
  //   • Accumulate data with `for await` (native backpressure, zero copy)
  //   • Use pre-sized Buffer.concat (skip Node's internal size-scan loop)
  //   • Pipeline Cache set (1 round-trip instead of 2)

  private async _pipeStream(
    meetingId: string,
    rawStream: NodeJS.ReadableStream,
    uploadUrl: string,
    mimeType: string,
  ): Promise<{
    // Parse the upload URL once here — not on every chunk PUT (saves URL parsing overhead)
    // uploadUrl is a long googleapis.com URL with a unique upload_id query param.
    fileId: string;
    webViewLink: string;
    webContentLink: string;
    totalBytes: number;
    chunksUploaded: number;
  }> {
    // Parse once — reused for every chunk PUT request
    const parsedUrl = new URL(uploadUrl);
    const urlPath = parsedUrl.pathname + parsedUrl.search;

    const pieces: Buffer[] = [];
    let pieceSize = 0;
    let byteOffset = 0;
    let chunksUploaded = 0;
    let totalReceived = 0;
    let lastProgressAt = 0;
    let lastResult = { fileId: '', webViewLink: '', webContentLink: '' };

    for await (const raw of rawStream) {
      const piece: Buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
      pieces.push(piece);
      pieceSize += piece.length;
      totalReceived += piece.length;

      // Progress publish (fire-and-forget — never block the upload loop)
      if (totalReceived - lastProgressAt >= PROGRESS_INTERVAL_BYTES) {
        lastProgressAt = totalReceived;
        this._publishProgress({
          meetingId,
          bytesUploaded: byteOffset,
          totalBytes: null,
          chunksUploaded,
          status: 'streaming',
          message: `Received ${fmt(totalReceived)}, uploaded ${fmt(byteOffset)}`,
        }).catch(() => {});
      }

      // Flush exactly CHUNK_SIZE_BYTES at a time.
      // WHY while loop: a single TCP segment can push pieceSize to e.g. 10.15 MB.
      // Sending an oversized non-final chunk causes byteOffset to drift ahead of
      // what Drive actually confirms (Drive rounds to 256 KB boundaries), leading
      // to HTTP 503 "upload offset exceeds already uploaded size".
      // Slicing at exactly CHUNK_SIZE_BYTES and carrying the remainder forward
      // guarantees every non-final chunk is an exact multiple of CHUNK_SIZE_BYTES.
      while (pieceSize >= CHUNK_SIZE_BYTES) {
        const combined = Buffer.concat(pieces, pieceSize);
        const chunkToSend = combined.slice(0, CHUNK_SIZE_BYTES);   // exact 10 MB
        const remainder  = combined.slice(CHUNK_SIZE_BYTES);        // leftover

        pieces.length = 0;
        pieceSize = remainder.length;
        if (pieceSize > 0) pieces.push(remainder);

        lastResult = await this._putChunkWithRetry(parsedUrl.hostname, urlPath, chunkToSend, byteOffset, '*', mimeType, false);
        byteOffset += CHUNK_SIZE_BYTES; // always exact — no drift
        chunksUploaded++;

        this.logger.debug(`Chunk ${chunksUploaded}: ${fmt(byteOffset)} uploaded`);
      }
    }

    // Stream ended — publish finalizing, then flush the last partial chunk
    this.logger.log(
      `📡 Stream ended: ${fmt(totalReceived)} received. Finalizing...`,
    );

    await this._publishProgress({
      meetingId,
      bytesUploaded: byteOffset,
      totalBytes: totalReceived,
      chunksUploaded,
      status: 'finalizing',
      message: 'Sending final chunk to Google Drive...',
    });

    const finalChunk = pieceSize > 0 ? Buffer.concat(pieces, pieceSize) : Buffer.alloc(0);
    const totalBytes = byteOffset + finalChunk.length;

    lastResult = await this._putChunkWithRetry(parsedUrl.hostname, urlPath, finalChunk, byteOffset, totalBytes, mimeType, true);
    byteOffset += finalChunk.length;
    chunksUploaded++;

    return {
      fileId: lastResult.fileId,
      webViewLink: lastResult.webViewLink,
      webContentLink: lastResult.webContentLink,
      totalBytes: byteOffset,
      chunksUploaded,
    };
  }

  // ── Private: PUT one chunk — with exponential backoff retry ─────────────
  //
  // Drive responds:
  //   308 Resume Incomplete — chunk accepted, send the next one
  //   200 / 201             — final chunk accepted, file created
  //   503 / 429             — transient error → retry with backoff
  //
  // Retry schedule: attempt 1 (immediate) → wait 1s → wait 2s → wait 4s → fail

  private async _putChunkWithRetry(
    hostname: string,
    urlPath: string,
    chunk: Buffer,
    byteOffset: number,
    totalSize: number | '*',
    mimeType: string,
    isFinal: boolean,
  ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
    let lastError: Error = new Error('unreachable');

    for (let attempt = 0; attempt <= MAX_CHUNK_RETRIES; attempt++) {
      if (attempt > 0) {
        const delayMs = RETRY_BASE_MS * 2 ** (attempt - 1); // 1s, 2s, 4s
        this.logger.warn(
          `⚠️  Chunk at offset ${fmt(byteOffset)} failed (attempt ${attempt}/${MAX_CHUNK_RETRIES}). ` +
          `Retrying in ${delayMs / 1000}s...`,
        );
        await new Promise<void>((r) => setTimeout(r, delayMs));
      }

      try {
        return await this._putChunk(hostname, urlPath, chunk, byteOffset, totalSize, mimeType);
      } catch (err: any) {
        lastError = err;
        // Only retry on transient errors. A 4xx (except 429) means a real bug — stop immediately.
        const isRetryable =
          err.message.includes('503') ||
          err.message.includes('429') ||
          err.message.includes('ECONNRESET') ||
          err.message.includes('ETIMEDOUT') ||
          err.message.includes('socket hang up');

        if (!isRetryable) throw err;
      }
    }

    throw lastError;
  }

  private _putChunk(
    hostname: string,
    urlPath: string,
    chunk: Buffer,
    byteOffset: number,
    totalSize: number | '*',
    mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
    return new Promise((resolve, reject) => {
      const end = byteOffset + chunk.length - 1;
      const total = totalSize === '*' ? '*' : String(totalSize);
      const contentRange =
        chunk.length === 0
          ? `bytes */${total}`
          : `bytes ${byteOffset}-${end}/${total}`;

      const req = https.request(
        {
          hostname,
          path: urlPath,
          method: 'PUT',
          agent: httpsAgent,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': chunk.length,
            'Content-Range': contentRange,
          },
        } as https.RequestOptions,
        (res) => {
          if (res.statusCode === 308) {
            res.resume(); // drain → socket back to pool
            return resolve({ fileId: '', webViewLink: '', webContentLink: '' });
          }

          const buffers: Buffer[] = [];
          res.on('data', (d: Buffer) => buffers.push(d));
          res.on('end', () => {
            const body = Buffer.concat(buffers).toString();

            if (res.statusCode === 200 || res.statusCode === 201) {
              try {
                const data = JSON.parse(body);
                return resolve({
                  fileId: data.id ?? '',
                  webViewLink:
                    data.webViewLink ??
                    `https://drive.google.com/file/d/${data.id}/view`,
                  webContentLink:
                    data.webContentLink ??
                    `https://drive.google.com/uc?id=${data.id}`,
                });
              } catch {
                return reject(new Error(`Drive 200 but body not JSON: ${body}`));
              }
            }

            reject(new Error(`Drive chunk failed: HTTP ${res.statusCode} — ${body}`));
          });
        },
      );

      req.on('error', reject);
      if (chunk.length > 0) req.write(chunk);
      req.end();
    });
  }

  // ── Private: Cache progress publisher ────────────────────────────────────

  private async _publishProgress(progress: UploadProgress): Promise<void> {
    const key = `recording:progress:${progress.meetingId}`;
    const channel = `recording:events:${progress.meetingId}`;
    await this.cacheService.set(key, progress, 3600);
    this.cacheService.events.emit(channel, JSON.stringify(progress));
  }

  // ── Public: Drive connection test ─────────────────────────────────────────

  async testConnection(): Promise<{ ok: boolean; folderId: string; quota: any }> {
    const about = await this.drive.about.get({ fields: 'storageQuota' });
    const q = about.data.storageQuota;
    return {
      ok: true,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
      quota: {
        limit: fmt(Number(q?.limit)),
        usage: fmt(Number(q?.usage)),
        usageInDrive: fmt(Number(q?.usageInDrive)),
      },
    };
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────
// Module-level (not on prototype) → no `this` lookup on every log call.

function fmt(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 4);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}