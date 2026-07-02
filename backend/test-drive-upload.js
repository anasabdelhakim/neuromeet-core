/**
 * test-drive-upload.js
 *
 * Streams a real local video file to the Drive recording endpoint.
 * Also connects to the SSE progress endpoint to track Drive chunks in real time.
 *
 * Run:  node test-drive-upload.js
 * Backend must be running: cd backend && npm run start:dev
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const VIDEO_PATH   = `D:\\Movies\\Insidious Chapter 3 (2015) [YTS.AG]`;
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 4000;
const MEETING_ID   = 'test-real-video-' + Date.now();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function findVideoFile(dir) {
  const exts = ['.mp4', '.mkv', '.webm', '.avi', '.mov'];
  const files = fs.readdirSync(dir);
  const found = files.find(f => exts.includes(path.extname(f).toLowerCase()));
  if (!found) throw new Error(`No video file found in: ${dir}`);
  return path.join(dir, found);
}

function getMimeType(filePath) {
  const map = {
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.mkv':  'video/x-matroska',
    '.avi':  'video/x-msvideo',
    '.mov':  'video/quicktime',
  };
  return map[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function fmt(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 3);
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

// ─── SSE: Subscribe to Drive chunk progress ───────────────────────────────────
// Connects to GET /api/v1/drive/recording/progress/:meetingId
// Prints a new line every time the backend confirms a chunk to Drive.
function subscribeToProgress(meetingId) {
  const progressPath = `/api/v1/drive/recording/progress/${meetingId}`;

  const req = http.request({
    hostname: BACKEND_HOST,
    port:     BACKEND_PORT,
    path:     progressPath,
    method:   'GET',
    headers:  { Accept: 'text/event-stream' },
  }, (res) => {
    console.log(`\n📊  SSE connected → ${progressPath}\n`);

    let buffer = '';

    res.on('data', (raw) => {
      buffer += raw.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const json = line.slice(5).trim();
        if (!json) continue;

        try {
          const evt = JSON.parse(json);

          switch (evt.status) {
            case 'waiting':
              console.log(`⏳  Drive: waiting for stream to start...`);
              break;

            case 'streaming': {
              const uploaded = fmt(evt.bytesUploaded);
              const chunks   = evt.chunksUploaded ?? 0;
              console.log(`📦  Drive chunk #${chunks} confirmed — ${uploaded} uploaded so far`);
              break;
            }

            case 'finalizing':
              console.log(`\n🔄  Drive: finalizing last chunk (${fmt(evt.bytesUploaded)} uploaded)...`);
              break;

            case 'complete': {
              const total = fmt(evt.bytesUploaded);
              console.log(`\n✅  Drive: COMPLETE — ${total} in ${evt.chunksUploaded} chunks`);
              break;
            }

            case 'error':
              console.error(`\n❌  Drive ERROR: ${evt.message}`);
              break;
          }
        } catch {
          // ignore non-JSON SSE lines (keepalive pings)
        }
      }
    });

    res.on('error', (err) => {
      console.error('SSE stream error:', err.message);
    });
  });

  req.on('error', (err) => {
    console.error('SSE connect error:', err.message);
  });

  req.end();
  return req;
}

// ─── Upload: stream file to backend → Drive ───────────────────────────────────
function uploadFile(videoFile, fileStat, mimeType) {
  const endpoint  = `/api/v1/drive/recording/stream/${MEETING_ID}`;
  const fileSizeMB = (fileStat.size / 1024 / 1024).toFixed(1);

  console.log('─────────────────────────────────────────────────────────');
  console.log('🎬  Drive Upload — Real Video Test');
  console.log(`📁  File     : ${path.basename(videoFile)}`);
  console.log(`📦  Size     : ${fileSizeMB} MB`);
  console.log(`🎞️  MimeType : ${mimeType}`);
  console.log(`🆔  Meeting  : ${MEETING_ID}`);
  console.log(`📡  Upload   : POST http://${BACKEND_HOST}:${BACKEND_PORT}${endpoint}`);
  console.log(`📊  Progress : GET  http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1/drive/recording/progress/${MEETING_ID}`);
  console.log('─────────────────────────────────────────────────────────');

  const req = http.request({
    hostname: BACKEND_HOST,
    port:     BACKEND_PORT,
    path:     endpoint,
    method:   'POST',
    headers: {
      'Content-Type':   mimeType,
      'Content-Length': fileStat.size,
    },
    timeout: 600_000, // 10 minutes
  }, (res) => {
    console.log(`\n📨  HTTP Status : ${res.statusCode}`);

    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
      try {
        const json = JSON.parse(Buffer.concat(chunks).toString());
        console.log('\n📋  Final response:\n', JSON.stringify(json, null, 2));

        if (res.statusCode === 200 && json.fileId) {
          console.log('\n🎉  SUCCESS! File uploaded to Google Drive!');
          console.log(`🔗  View   : ${json.webViewLink}`);
          console.log(`📥  Download: ${json.webContentLink}`);
          if (json.stats) {
            console.log(`⚡  Speed  : ${json.stats.avgSpeedMBps} MB/s`);
            console.log(`⏱️  Time   : ${json.stats.durationSeconds}s`);
          }
        } else {
          console.log('\n❌  Upload failed — see response above.');
        }
      } catch {
        console.log('\n📄  Raw:', Buffer.concat(chunks).toString());
      }

      process.exit(0);
    });
  });

  req.on('timeout', () => {
    console.error('\n❌  Timeout — exceeded 10 minutes.');
    req.destroy();
  });

  req.on('error', (err) => {
    console.error('\n❌  Upload error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('💡  Is the backend running?  npm run start:dev');
    }
  });

  // Local → backend progress bar
  let uploaded  = 0;
  const startMs = Date.now();
  const fileStream = fs.createReadStream(videoFile);

  fileStream.on('data', (chunk) => {
    uploaded += chunk.length;
    const pct     = ((uploaded / fileStat.size) * 100).toFixed(1);
    const mb      = (uploaded / 1024 / 1024).toFixed(1);
    const elapsed = ((Date.now() - startMs) / 1000).toFixed(0);
    process.stdout.write(`\r📤  Local→Backend: ${mb} MB / ${fileSizeMB} MB  (${pct}%)  [${elapsed}s]`);
  });

  fileStream.on('end', () => {
    console.log('\n\n📡  All bytes sent to backend — Drive is now uploading chunk by chunk...\n');
  });

  fileStream.pipe(req);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
function runTest() {
  const videoFile = findVideoFile(VIDEO_PATH);
  const fileStat  = fs.statSync(videoFile);
  const mimeType  = getMimeType(videoFile);

  // 1. Subscribe to SSE progress FIRST (before the upload starts)
  //    Small delay so the SSE connection is established before the upload hits
  setTimeout(() => subscribeToProgress(MEETING_ID), 100);

  // 2. Start streaming the file
  setTimeout(() => uploadFile(videoFile, fileStat, mimeType), 300);
}

runTest();
