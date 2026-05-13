// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { google, drive_v3 } from 'googleapis';
// import { Readable, PassThrough } from 'stream';
// import { InjectRedis } from '@nestjs-modules/ioredis'; // or your Redis provider
// import type Redis from 'ioredis';
// import * as https from 'https';

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface UploadFileData {
//   originalname: string;
//   mimetype: string;
//   buffer: Buffer;
// }

// export interface RecordingUploadResult {
//   fileId: string;
//   webViewLink: string;
//   webContentLink: string;
//   totalBytes: number;
//   chunksUploaded: number;
//   durationMs: number;
// }

// export interface UploadProgress {
//   meetingId: string;
//   bytesUploaded: number;
//   totalBytes: number | null; // null when total is unknown (live stream)
//   chunksUploaded: number;
//   status: 'streaming' | 'finalizing' | 'complete' | 'error';
//   message: string;
// }

// // ─── Configuration ────────────────────────────────────────────────────────────

// // Each chunk sent to Drive. 5 MB is the minimum Google requires
// // for resumable upload chunks (except the very last one).
// // Larger chunks = fewer round-trips = faster upload.
// // 10 MB is a good balance for a 1 Gbps connection.
// const CHUNK_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// // How often to publish progress to Redis (in bytes received)
// // Publish every 10 MB received so the frontend heatmap updates smoothly
// const PROGRESS_INTERVAL_BYTES = 10 * 1024 * 1024; // 10 MB

// // Drive resumable upload endpoint
// const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

// // ─────────────────────────────────────────────────────────────────────────────

// @Injectable()
// export class DriveService implements OnModuleInit {
//   private readonly logger = new Logger(DriveService.name);
//   private drive: drive_v3.Drive;
//   private oauth2Client: InstanceType<typeof google.auth.OAuth2>;

//   constructor(@InjectRedis() private readonly redis: Redis) {}

//   // ── Lifecycle ───────────────────────────────────────────────────────────────

//   onModuleInit() {
//     this.oauth2Client = new google.auth.OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI ||
//         'https://developers.google.com/oauthplayground',
//     );

//     this.oauth2Client.setCredentials({
//       refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
//     });

//     // Auto-refresh access token before it expires
//     this.oauth2Client.on('tokens', (tokens) => {
//       if (tokens.refresh_token) {
//         this.logger.log('🔄 Drive OAuth2 refresh token rotated');
//         // In production: persist the new refresh_token to DB here
//       }
//       this.logger.log('✅ Drive access token refreshed automatically');
//     });

//     this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
//     this.logger.log('✅ DriveService initialized with OAuth2 client');
//   }

//   // ── Public: Simple file upload (materials, images, small files <500 MB) ────

//   /**
//    * Uploads a file that fits in memory.
//    * Use this for: slides, PDFs, images, any material < 500 MB.
//    * NOT for recordings — use streamRecordingToDrive() instead.
//    */
//   async uploadFile(
//     fileData: UploadFileData,
//     folderId?: string,
//   ): Promise<{ fileId: string; webViewLink: string }> {
//     const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!;

//     this.logger.log(
//       `📤 Uploading file: ${fileData.originalname} (${this._formatBytes(fileData.buffer.length)})`,
//     );

//     const fileMetadata: drive_v3.Schema$File = {
//       name: fileData.originalname,
//       parents: [targetFolder],
//     };

//     const media = {
//       mimeType: fileData.mimetype,
//       body: Readable.from(fileData.buffer),
//     };

//     const response = await this.drive.files.create({
//       requestBody: fileMetadata,
//       media,
//       fields: 'id, webViewLink',
//     });

//     this.logger.log(`✅ File uploaded: ${response.data.id}`);

//     return {
//       fileId: response.data.id!,
//       webViewLink: response.data.webViewLink!,
//     };
//   }

//   // ── Public: Large recording stream upload ───────────────────────────────────

//   /**
//    * Streams a large recording from a Fastify raw request body
//    * directly to Google Drive using a resumable upload session.
//    *
//    * Architecture:
//    *   Fastify raw stream
//    *     → PassThrough (we tap for progress tracking)
//    *       → 10 MB chunk buffer
//    *         → Google Drive Resumable Upload API (one PUT per chunk)
//    *
//    * This means:
//    * - RAM usage stays at ~10 MB regardless of file size
//    * - A 2-hour 4K recording (~4 GB) uploads without any memory issues
//    * - If the connection drops mid-upload, we can resume from the last confirmed byte
//    * - Progress events publish to Redis so the frontend can show live upload status
//    *
//    * @param meetingId   Used for Redis progress key and Drive folder naming
//    * @param rawStream   The raw Node.js IncomingMessage / Fastify request stream
//    * @param mimeType    Usually 'video/webm' from LiveKit Egress
//    * @param folderId    Target Drive folder (defaults to env var)
//    */
//   async streamRecordingToDrive(
//     meetingId: string,
//     rawStream: NodeJS.ReadableStream,
//     mimeType: string = 'video/webm',
//     folderId?: string,
//   ): Promise<RecordingUploadResult> {
//     const startTime = Date.now();
//     const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!;
//     const fileName = `recording-${meetingId}-${Date.now()}.webm`;

//     this.logger.log(
//       `🎬 Starting recording stream upload for meeting: ${meetingId}`,
//     );

//     // ── Step 1: Get a fresh access token ───────────────────────────────────
//     const accessToken = await this._getFreshAccessToken();

//     // ── Step 2: Open a Drive resumable upload session ──────────────────────
//     // This gives us a unique upload URL that survives network drops for 7 days
//     const uploadUrl = await this._initResumableSession(
//       fileName,
//       mimeType,
//       targetFolder,
//       accessToken,
//     );

//     this.logger.log(`🔗 Resumable upload session opened for: ${fileName}`);

//     // ── Step 3: Stream chunks through to Drive ─────────────────────────────
//     const result = await this._pipeStreamInChunks(
//       meetingId,
//       rawStream,
//       uploadUrl,
//       accessToken,
//       mimeType,
//     );

//     const durationMs = Date.now() - startTime;

//     this.logger.log(
//       `✅ Recording uploaded for meeting ${meetingId}: ` +
//         `${this._formatBytes(result.totalBytes)} in ${Math.round(durationMs / 1000)}s ` +
//         `(${this._formatBytes(result.totalBytes / (durationMs / 1000))}/s avg)`,
//     );

//     // ── Step 4: Publish completion to Redis ───────────────────────────────
//     await this._publishProgress({
//       meetingId,
//       bytesUploaded: result.totalBytes,
//       totalBytes: result.totalBytes,
//       chunksUploaded: result.chunksUploaded,
//       status: 'complete',
//       message: `Recording upload complete: ${this._formatBytes(result.totalBytes)}`,
//     });

//     return {
//       ...result,
//       durationMs,
//     };
//   }

//   // ── Private: Get fresh OAuth2 access token ──────────────────────────────────

//   private async _getFreshAccessToken(): Promise<string> {
//     const { token } = await this.oauth2Client.getAccessToken();
//     if (!token) throw new Error('Failed to obtain Drive access token');
//     return token;
//   }

//   // ── Private: Open a Drive resumable upload session ──────────────────────────

//   /**
//    * POSTs to the Drive upload API to get a resumable session URI.
//    * The URI is valid for 7 days — store it in Redis if you want true
//    * crash-recovery across server restarts.
//    */
//   private async _initResumableSession(
//     fileName: string,
//     mimeType: string,
//     folderId: string,
//     accessToken: string,
//   ): Promise<string> {
//     const metadata = JSON.stringify({
//       name: fileName,
//       parents: [folderId],
//       mimeType,
//     });

//     return new Promise<string>((resolve, reject) => {
//       const reqOptions = {
//         hostname: 'www.googleapis.com',
//         path: `/upload/drive/v3/files?uploadType=resumable`,
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json; charset=UTF-8',
//           'Content-Length': Buffer.byteLength(metadata),
//           'X-Upload-Content-Type': mimeType,
//           // Don't set X-Upload-Content-Length — we don't know the size
//           // for a live stream. Drive handles * (unknown size) gracefully.
//         },
//       };

//       const req = https.request(reqOptions, (res) => {
//         if (res.statusCode !== 200) {
//           reject(
//             new Error(`Drive session init failed: HTTP ${res.statusCode}`),
//           );
//           return;
//         }
//         const location = res.headers['location'];
//         if (!location) {
//           reject(new Error('Drive did not return a Location header'));
//           return;
//         }
//         resolve(location as string);
//       });

//       req.on('error', reject);
//       req.write(metadata);
//       req.end();
//     });
//   }

//   // ── Private: Core streaming pipeline ────────────────────────────────────────

//   /**
//    * Reads the incoming stream in 10 MB chunks and PUTs each chunk
//    * to the Drive resumable upload URL with the correct Content-Range header.
//    *
//    * Memory model: only one 10 MB chunk is in RAM at a time.
//    * The previous chunk is GC'd after Drive confirms receipt (206).
//    */
//   private async _pipeStreamInChunks(
//     meetingId: string,
//     rawStream: NodeJS.ReadableStream,
//     uploadUrl: string,
//     accessToken: string,
//     mimeType: string,
//   ): Promise<{
//     fileId: string;
//     webViewLink: string;
//     webContentLink: string;
//     totalBytes: number;
//     chunksUploaded: number;
//   }> {
//     return new Promise((resolve, reject) => {
//       const chunkBuffer: Buffer[] = [];
//       let chunkBufferSize = 0;
//       let byteOffset = 0; // confirmed bytes sent to Drive
//       let chunksUploaded = 0;
//       let streamEnded = false;
//       let totalBytesReceived = 0;
//       let lastProgressAt = 0;

//       // PassThrough lets us monitor the stream without buffering it all
//       const pass = new PassThrough();
//       rawStream.pipe(pass);

//       // Accumulate data into chunk-sized buffers
//       pass.on('data', async (chunk: Buffer) => {
//         pass.pause(); // back-pressure: stop reading until we've processed

//         chunkBuffer.push(chunk);
//         chunkBufferSize += chunk.length;
//         totalBytesReceived += chunk.length;

//         // Publish progress every PROGRESS_INTERVAL_BYTES received
//         if (totalBytesReceived - lastProgressAt >= PROGRESS_INTERVAL_BYTES) {
//           lastProgressAt = totalBytesReceived;
//           this._publishProgress({
//             meetingId,
//             bytesUploaded: byteOffset,
//             totalBytes: null, // live stream — unknown total
//             chunksUploaded,
//             status: 'streaming',
//             message: `Received ${this._formatBytes(totalBytesReceived)}, uploaded ${this._formatBytes(byteOffset)}`,
//           }).catch(() => {}); // don't let Redis errors break the upload
//         }

//         // If we've accumulated a full chunk, send it to Drive
//         if (chunkBufferSize >= CHUNK_SIZE_BYTES) {
//           const chunkToSend = Buffer.concat(chunkBuffer);
//           chunkBuffer.length = 0;
//           chunkBufferSize = 0;

//           try {
//             await this._uploadChunk(
//               uploadUrl,
//               chunkToSend,
//               byteOffset,
//               '*', // unknown total — streaming
//               mimeType,
//               false, // not the final chunk
//             );
//             byteOffset += chunkToSend.length;
//             chunksUploaded++;
//             this.logger.debug(
//               `Chunk ${chunksUploaded} uploaded: ${this._formatBytes(byteOffset)} total`,
//             );
//           } catch (err) {
//             reject(err);
//             return;
//           }
//         }

//         pass.resume(); // back-pressure: ready for more data
//       });

//       pass.on('end', async () => {
//         streamEnded = true;
//         this.logger.log(
//           `📡 Stream ended for meeting ${meetingId}. ` +
//             `Total received: ${this._formatBytes(totalBytesReceived)}. ` +
//             `Finalizing with Drive...`,
//         );

//         await this._publishProgress({
//           meetingId,
//           bytesUploaded: byteOffset,
//           totalBytes: totalBytesReceived,
//           chunksUploaded,
//           status: 'finalizing',
//           message: 'Sending final chunk to Google Drive...',
//         });

//         // Flush whatever is left in the buffer as the FINAL chunk
//         const finalChunk =
//           chunkBuffer.length > 0 ? Buffer.concat(chunkBuffer) : Buffer.alloc(0);

//         const totalBytes = byteOffset + finalChunk.length;

//         try {
//           const driveResult = await this._uploadChunk(
//             uploadUrl,
//             finalChunk,
//             byteOffset,
//             totalBytes, // now we know the exact total — tell Drive
//             mimeType,
//             true, // this IS the final chunk
//           );

//           byteOffset += finalChunk.length;
//           chunksUploaded++;

//           resolve({
//             fileId: driveResult.fileId,
//             webViewLink: driveResult.webViewLink,
//             webContentLink: driveResult.webContentLink,
//             totalBytes: byteOffset,
//             chunksUploaded,
//           });
//         } catch (err) {
//           reject(err);
//         }
//       });

//       pass.on('error', (err) => {
//         this.logger.error(
//           `Stream error for meeting ${meetingId}:`,
//           err.message,
//         );
//         reject(err);
//       });
//     });
//   }

//   // ── Private: Upload a single chunk to Drive ──────────────────────────────────

//   /**
//    * PUTs a chunk to the Drive resumable upload URL.
//    *
//    * Content-Range header format:
//    *   Non-final chunk (unknown total): "bytes 0-10485759/*"
//    *   Final chunk (known total):       "bytes 10485760-14680063/14680064"
//    *
//    * Drive responds:
//    *   308 Resume Incomplete — chunk accepted, keep going
//    *   200 OK               — upload complete, returns file metadata
//    */
//   private _uploadChunk(
//     uploadUrl: string,
//     chunk: Buffer,
//     byteOffset: number,
//     totalSize: number | '*',
//     mimeType: string,
//     isFinal: boolean,
//   ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
//     return new Promise((resolve, reject) => {
//       const end = byteOffset + chunk.length - 1;
//       const total = totalSize === '*' ? '*' : totalSize.toString();
//       const contentRange =
//         chunk.length === 0
//           ? `bytes */${total}` // empty final chunk edge case
//           : `bytes ${byteOffset}-${end}/${total}`;

//       const urlObj = new URL(uploadUrl);

//       const reqOptions = {
//         hostname: urlObj.hostname,
//         path: urlObj.pathname + urlObj.search,
//         method: 'PUT',
//         headers: {
//           'Content-Type': mimeType,
//           'Content-Length': chunk.length,
//           'Content-Range': contentRange,
//         },
//       };

//       const req = https.request(reqOptions, (res) => {
//         let body = '';
//         res.on('data', (d) => (body += d));
//         res.on('end', () => {
//           // 308 = chunk accepted, continue
//           if (res.statusCode === 308) {
//             resolve({ fileId: '', webViewLink: '', webContentLink: '' });
//             return;
//           }

//           // 200 or 201 = upload complete
//           if (res.statusCode === 200 || res.statusCode === 201) {
//             try {
//               const data = JSON.parse(body);
//               resolve({
//                 fileId: data.id || '',
//                 webViewLink:
//                   data.webViewLink ||
//                   `https://drive.google.com/file/d/${data.id}/view`,
//                 webContentLink:
//                   data.webContentLink ||
//                   `https://drive.google.com/uc?id=${data.id}`,
//               });
//             } catch {
//               reject(
//                 new Error(`Drive returned 200 but body was not JSON: ${body}`),
//               );
//             }
//             return;
//           }

//           // 5xx — Drive server error, worth retrying (handled by controller)
//           reject(
//             new Error(
//               `Drive chunk upload failed: HTTP ${res.statusCode} — ${body}`,
//             ),
//           );
//         });
//       });

//       req.on('error', reject);

//       if (chunk.length > 0) {
//         req.write(chunk);
//       }
//       req.end();
//     });
//   }

//   // ── Private: Resume an interrupted upload ────────────────────────────────────

//   /**
//    * Call this if the server restarts mid-upload.
//    * Asks Drive how many bytes it has received, returns the resume offset.
//    * Store the uploadUrl in Redis (keyed by meetingId) to enable this.
//    */
//   async getResumeOffset(uploadUrl: string): Promise<number> {
//     return new Promise((resolve, reject) => {
//       const urlObj = new URL(uploadUrl);
//       const reqOptions = {
//         hostname: urlObj.hostname,
//         path: urlObj.pathname + urlObj.search,
//         method: 'PUT',
//         headers: {
//           'Content-Range': 'bytes */*', // "tell me where you are"
//           'Content-Length': 0,
//         },
//       };

//       const req = https.request(reqOptions, (res) => {
//         if (res.statusCode === 308) {
//           // Range header tells us: bytes=0-N (N+1 = next expected byte)
//           const range = res.headers['range'];
//           if (range) {
//             const match = range.match(/bytes=0-(\d+)/);
//             if (match) {
//               resolve(parseInt(match[1], 10) + 1);
//               return;
//             }
//           }
//           resolve(0); // Drive has nothing yet
//           return;
//         }
//         if (res.statusCode === 200 || res.statusCode === 201) {
//           resolve(-1); // upload already complete
//           return;
//         }
//         reject(new Error(`Resume query failed: HTTP ${res.statusCode}`));
//       });

//       req.on('error', reject);
//       req.end();
//     });
//   }

//   // ── Private: Redis progress publisher ────────────────────────────────────────

//   private async _publishProgress(progress: UploadProgress): Promise<void> {
//     const key = `recording:progress:${progress.meetingId}`;
//     const channel = `recording:events:${progress.meetingId}`;

//     // Store latest state (for SSE on reconnect)
//     await this.redis.setex(key, 3600, JSON.stringify(progress));

//     // Publish to channel (for live SSE subscribers)
//     await this.redis.publish(channel, JSON.stringify(progress));
//   }

//   // ── Test endpoint helper ──────────────────────────────────────────────────────

//   async testConnection(): Promise<{
//     ok: boolean;
//     folderId: string;
//     quota: any;
//   }> {
//     const about = await this.drive.about.get({
//       fields: 'storageQuota, user',
//     });

//     return {
//       ok: true,
//       folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
//       quota: {
//         limit: this._formatBytes(Number(about.data.storageQuota?.limit)),
//         usage: this._formatBytes(Number(about.data.storageQuota?.usage)),
//         usageInDrive: this._formatBytes(
//           Number(about.data.storageQuota?.usageInDrive),
//         ),
//       },
//     };
//   }

//   // ── Utility ───────────────────────────────────────────────────────────────────

//   private _formatBytes(bytes: number): string {
//     if (bytes === 0) return '0 B';
//     const k = 1024;
//     const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
//   }
// }
