# 📚 Backend Dependencies — Study Reference
> **Project:** NeuroMeet  
> **Runtime:** Bun + NestJS 11 (Fastify adapter)  
> **Language:** TypeScript  
> **Purpose:** Every package explained — what it is, why it exists, how it's used HERE, minimal example, and where to learn it.

---

## 🗂️ Dependency Groups

1. [Core Framework — NestJS](#1-core-framework--nestjs)
2. [HTTP Engine — Fastify](#2-http-engine--fastify)
3. [Database — Prisma + PostgreSQL](#3-database--prisma--postgresql)
4. [Authentication & Security](#4-authentication--security)
5. [Real-Time — Events & WebRTC](#5-real-time--events--webrtc)
6. [External APIs](#6-external-apis)
7. [Validation & Transformation](#7-validation--transformation)
8. [Dev Tools & Testing](#8-dev-tools--testing)

---

## 1. Core Framework — NestJS

---

### `@nestjs/common` + `@nestjs/core` — v11
**What it is:** NestJS is the main backend framework. It brings structure to Node.js by enforcing a modular, decorator-based architecture inspired by Angular.

**The mental model — 3 layers:**
```
HTTP Request
     ↓
Controller (@Controller, @Get, @Post)
  → Extracts data from request (@Body, @Param, @Query)
  → Calls the Service
     ↓
Service (@Injectable)
  → Business logic (validation, DB calls, emails)
     ↓
Repository / Prisma
  → Database queries
     ↓
Response sent back
```

**Dependency Injection — the most important concept:**
```typescript
// 1. Mark a class as injectable (can be provided to others)
@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,   // ← NestJS creates and injects these
    private cache: CacheService,
    private emailService: EmailService,
  ) {}
  // NestJS creates ONE instance of MeetingsService and shares it everywhere.
  // You never write: new MeetingsService()
}

// 2. A module declares what exists and what it needs:
@Module({
  imports: [CacheModule, EmailModule],  // ← import providers from other modules
  providers: [MeetingsService],          // ← register your services here
  controllers: [MeetingsController],    // ← register HTTP handlers here
})
export class MeetingsModule {}

// 3. A controller uses the service:
@Controller('meetings')
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {} // ← injected

  @Get()
  @UseGuards(AuthGuard)
  getAllMeetings(@Req() req) {
    return this.meetingsService.getAllMeetings(req.user.id);
  }
}
```

**Key decorators you'll see everywhere:**

| Decorator | Meaning |
|---|---|
| `@Module({})` | Declares a module with imports/providers/controllers |
| `@Injectable()` | This class can be injected via DI |
| `@Controller('path')` | This class handles HTTP requests at /path |
| `@Get()` `@Post()` `@Patch()` `@Delete()` | HTTP method + route |
| `@Body()` | Extract request body |
| `@Param('id')` | Extract URL parameter |
| `@Query('key')` | Extract query string ?key=value |
| `@UseGuards(AuthGuard)` | Run this guard before the handler |
| `@Req()` | Get the full request object |

**📖 Learn:** https://docs.nestjs.com — Do "First Steps", then "Modules", "Providers", "Controllers", "Guards"

---

### `@nestjs/config` — v4
**What it is:** Handles environment variables in NestJS. Loads `.env` files and provides `ConfigService` to read values anywhere in the app.

**How it's used:**
```typescript
// app.module.ts:
ConfigModule.forRoot({ isGlobal: true }) // isGlobal = no need to import in every module

// In any service:
constructor(private configService: ConfigService) {}
const secret = this.configService.get<string>('JWT_SECRET');

// OR just use process.env directly (how NeuroMeet does it):
const secret = process.env.JWT_SECRET;
```

**📖 Learn:** https://docs.nestjs.com/techniques/configuration

---

### `@nestjs/schedule` — v6
**What it is:** Adds cron job support to NestJS. Methods decorated with `@Cron()` run automatically on a schedule.

**How it's used in NeuroMeet:**
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CacheService {
  // Runs every 5 minutes automatically — evicts expired cache entries
  @Cron(CronExpression.EVERY_5_MINUTES)
  evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) this.cache.delete(key);
    }
  }
}

// Also used in MeetingsService to clean up ghost meetings every 5 min
@Cron(CronExpression.EVERY_5_MINUTES)
async cleanupGhostMeetings() { ... }
```

**📖 Learn:** https://docs.nestjs.com/techniques/task-scheduling

---

### `@nestjs/event-emitter` — v3
**What it is:** Wraps Node.js's built-in `EventEmitter` for use in NestJS. Used for in-process pub/sub (publish events from one service, subscribe in another, without going to a database or external queue).

**How it's used in NeuroMeet — the SSE pipeline:**
```typescript
// In DriveService (publisher) — on upload progress:
this.cacheService.events.emit(
  `recording:events:${meetingId}`,
  JSON.stringify({ bytesUploaded, totalBytes, status })
);

// In the SSE endpoint (subscriber) — streaming to browser:
const handler = (data: string) => res.write(`data: ${data}\n\n`);
cacheService.events.on(`recording:events:${meetingId}`, handler);
// When client disconnects:
req.socket.on('close', () => cacheService.events.removeListener(channel, handler));
```

This is how the instructor's dashboard shows a live progress bar during video upload — no WebSocket, no external service.

**📖 Learn:** https://docs.nestjs.com/techniques/events and https://nodejs.org/api/events.html

---

### `@nestjs/throttler` — v6
**What it is:** Rate limiting middleware. Limits how many requests an IP can make in a time window. Prevents API abuse.

**How it's used:**
```typescript
// app.module.ts:
ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]) // 10 requests per 60 seconds

// Global guard applied in app.module.ts providers:
{ provide: APP_GUARD, useClass: ThrottlerGuard }

// Skip rate limit on specific endpoints:
@SkipThrottle()
@Get('public')
getPublicData() { ... }
```

**📖 Learn:** https://docs.nestjs.com/security/rate-limiting

---

### `@nestjs/passport` — v11
**What it is:** Integrates Passport.js authentication strategies into NestJS. Used specifically here for the Google OAuth 2.0 strategy.

**📖 Learn:** https://docs.nestjs.com/security/authentication

---

### `@nestjs/axios` — v4
**What it is:** Wraps Axios (HTTP client) as a NestJS module with dependency injection. Used for making HTTP requests from the backend to external services.

**📖 Learn:** https://docs.nestjs.com/techniques/http-module

---

### `rxjs` — v7.8.1
**What it is:** Reactive Extensions for JavaScript. A library for composing async operations using Observables. NestJS uses it internally — you'll encounter it when working with interceptors, pipes, and Axios responses.

**The key concept:**
```typescript
import { Observable, of, map } from 'rxjs';

// An Observable is like a Promise but can emit multiple values over time
const stream$ = of(1, 2, 3).pipe(
  map(x => x * 2)
); // emits: 2, 4, 6
```

In NeuroMeet, RxJS shows up in `@nestjs/axios` responses (which return `Observable<AxiosResponse>` instead of `Promise`).

**📖 Learn:** https://rxjs.dev/guide/overview — Focus on the basics, not the full API

---

## 2. HTTP Engine — Fastify

---

### `@nestjs/platform-fastify` + `fastify` — v11 / v5
**What it is:** By default NestJS uses Express. NeuroMeet swaps it for **Fastify** — a significantly faster HTTP engine with better streaming support.

**Why Fastify here?**
- The Google Drive upload pipeline streams large video files. Fastify's native streaming is essential.
- Fastify is ~30% faster than Express on raw throughput benchmarks.
- Better plugin ecosystem for streaming, cookies, multipart.

**How it's wired up:**
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ bodyLimit: 8 * 1024 * 1024 * 1024 }) // 8GB body limit for recordings
);
```

**📖 Learn:** https://docs.nestjs.com/techniques/performance and https://fastify.dev/docs/latest/

---

### `@fastify/multipart` — v10
**What it is:** Fastify plugin to handle `multipart/form-data` requests — i.e., file uploads.

**How it's used:**
```typescript
// main.ts — registered as a plugin:
await fastifyAdapter.register(fastifyMultipart, {
  attachFieldsToBody: false, // keep streaming — don't buffer into memory
});

// In a route handler:
@Post('upload-material')
async uploadMaterial(@Req() req) {
  const data = await req.file(); // get the stream
  // pipe to Google Drive
}
```

**📖 Learn:** https://github.com/fastify/fastify-multipart

---

### `@fastify/cookie` — v11
**What it is:** Fastify plugin to parse and set HTTP cookies.

**How it's used:** The OAuth callback sets `httpOnly` cookies with JWT tokens.
```typescript
reply.setCookie('access_token', token, {
  httpOnly: true,    // JavaScript CANNOT read this
  secure: true,      // HTTPS only in production
  sameSite: 'lax',  // CSRF protection
  path: '/',
  maxAge: 3600,      // 1 hour
});
```

**📖 Learn:** https://github.com/fastify/fastify-cookie

---

### `@fastify/helmet` — v13
**What it is:** Fastify plugin that sets security HTTP headers automatically.

**Headers it sets (used in main.ts):**
- `Content-Security-Policy` — blocks scripts not from your domain
- `X-Content-Type-Options: nosniff` — prevents MIME type sniffing
- `X-Frame-Options` — prevents clickjacking
- `Strict-Transport-Security` — forces HTTPS

**📖 Learn:** https://helmetjs.github.io

---

## 3. Database — Prisma + PostgreSQL

---

### `prisma` + `@prisma/client` — v7.8.0
**What it is:** Prisma is a next-generation ORM (Object-Relational Mapper). You define your database schema in `prisma/schema.prisma`, run migrations, and get a fully type-safe client to query your database.

**The workflow:**
```bash
# 1. Edit schema.prisma (define your models)
# 2. Create a migration (generates SQL)
bun run prisma migrate dev --name add_sessions_table
# 3. Prisma generates the client (TypeScript types matching your schema)
# 4. Use in code:
```

**How it's used — common patterns:**
```typescript
// Find a single record:
const user = await this.prisma.user.findUnique({
  where: { email: 'student@example.com' },
  select: { id: true, name: true, role: true }, // Only get what you need
});

// Create:
const meeting = await this.prisma.meeting.create({
  data: { title: 'Math Lecture', hostId: user.id, status: 'SCHEDULED' },
});

// Update:
await this.prisma.user.update({
  where: { id: userId },
  data: { failedLoginAttempts: { increment: 1 } },
});

// Query with relations (JOIN equivalent):
const meetings = await this.prisma.meeting.findMany({
  where: { hostId: userId },
  include: {
    participants: true,      // JOIN with participants
    host: { select: { name: true } }, // JOIN with user, only get name
  },
});

// Transaction (atomic — all succeed or all rollback):
await this.prisma.$transaction([
  this.prisma.session.delete({ where: { id: oldSession.id } }),
  this.prisma.session.create({ data: { ...newSession } }),
]);
```

**The schema file — what drives everything:**
```prisma
// prisma/schema.prisma
model User {
  id       String @id @default(cuid())  // auto-generate unique ID
  email    String @unique
  password String
  role     Role   @default(STUDENT)     // enum type
  sessions Session[]                    // relation: one user, many sessions

  @@index([email])  // database index for fast lookups
}
```

**📖 Learn:** https://www.prisma.io/docs — Do "Quickstart", then "CRUD", then "Relations"

---

### `@prisma/adapter-pg` + `pg` — v8.20.0
**What they are:** `pg` is the official PostgreSQL driver for Node.js. `@prisma/adapter-pg` lets Prisma use this driver directly (instead of Prisma's built-in binary). Better performance and connection pooling control.

**📖 Learn PostgreSQL basics:** https://www.postgresql.org/docs/current/tutorial.html

---

## 4. Authentication & Security

---

### `@nestjs/jwt` — v11
**What it is:** NestJS wrapper around the `jsonwebtoken` library. Signs and verifies JSON Web Tokens.

**What is a JWT?**
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJTVFVERU5UIn0.signature
       header                        payload                        signature

header:  { "alg": "HS256" }                         ← algorithm used
payload: { "id": "123", "role": "STUDENT", "exp": 1234567890 }  ← your data
signature: HMAC(base64(header) + "." + base64(payload), secret)  ← tamper proof
```

Anyone can READ a JWT (it's just base64). But only the server with the secret can CREATE or VERIFY one.

**How it's used:**
```typescript
// Sign (create) a token:
const accessToken = this.jwtService.sign(
  { id: user.id, email: user.email, role: user.role },  // payload
  { secret: process.env.JWT_SECRET, expiresIn: '15m' }  // options
);

// Verify (check) a token in AuthGuard:
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.JWT_SECRET,
});
// payload = { id, email, role, iat, exp }
```

**Access Token vs Refresh Token:**
| | Access Token | Refresh Token |
|---|---|---|
| **Lifetime** | 15 minutes | 7 days |
| **Stored in** | httpOnly cookie | httpOnly cookie |
| **Stored in DB** | No | SHA-256 hash in Session table |
| **Purpose** | Prove identity on every request | Get a new access token when it expires |

**📖 Learn:** https://jwt.io (interactive decoder) + https://docs.nestjs.com/security/authentication

---

### `passport-google-oauth2` — v0.2.0
**What it is:** A Passport.js strategy for Google OAuth 2.0. Handles the redirect flow to Google's login page and back.

**The OAuth 2.0 flow (what happens when you click "Login with Google"):**
```
1. Browser → GET /oauth/google
2. NestJS → redirect to https://accounts.google.com/o/oauth2/auth?client_id=...&scope=email+profile
3. Google shows login page
4. User logs in
5. Google → redirect to your callback: GET /oauth/google/callback?code=AUTH_CODE
6. NestJS exchanges code for access token (server-to-server call to Google)
7. NestJS gets user's email + name from Google
8. NestJS creates/finds the user in DB, issues JWT, sets httpOnly cookies
9. Browser → redirect to dashboard
```

**📖 Learn:** https://developers.google.com/identity/protocols/oauth2/web-server

---

### `class-validator` + `class-transformer` — v0.15.1 / v0.5.1
**What they are:** Used together with NestJS's `ValidationPipe` to validate incoming request bodies.

**How it's used — DTOs (Data Transfer Objects):**
```typescript
// DTO = defines the shape of expected request data
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// In main.ts, the ValidationPipe runs these decorators on every incoming body:
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip fields not in DTO
  forbidNonWhitelisted: true,// Throw error if extra fields sent
  transform: true,           // Auto-convert string '123' to number 123 etc.
}));

// class-transformer handles the conversion:
// '2026-09-05T10:00:00Z' (string from JSON) → new Date(...) (Date object)
```

**📖 Learn:** https://github.com/typestack/class-validator and https://docs.nestjs.com/pipes

---

### `reflect-metadata` — v0.2.2
**What it is:** A polyfill that enables TypeScript decorators to work at runtime. Without it, all NestJS decorators (`@Injectable`, `@Controller`, etc.) would fail silently.

You never use this directly — it's imported once at the top of `main.ts`:
```typescript
import 'reflect-metadata';
```

**📖 Learn:** This is a low-level detail — understand decorators first, then this makes sense.

---

## 5. Real-Time — Events & WebRTC

---

### `livekit-server-sdk` — v2.15.2
**What it is:** The Node.js/TypeScript server SDK for LiveKit. Used to:
1. Create and manage rooms on the LiveKit server
2. Generate JWT tokens that authorize clients (browsers, bots) to join rooms
3. Manage participants and tracks server-side

**Key difference from frontend SDK:**
- Frontend SDK (`livekit-client`) = for browsers, handles WebRTC
- Server SDK (`livekit-server-sdk`) = for your backend, controls the server

**How it's used:**
```typescript
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';

// Create a token for a user to join a room:
const token = new AccessToken(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
  { identity: userId, name: userName }
);
token.addGrant({ roomJoin: true, room: roomName, canPublish: true });
const jwt = await token.toJwt();

// Create/delete rooms:
const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
await roomService.createRoom({ name: roomName, emptyTimeout: 300 });
await roomService.deleteRoom(roomName);
```

**📖 Learn:** https://docs.livekit.io/realtime/server/managing-rooms/

---

## 6. External APIs

---

### `googleapis` — v171
**What it is:** Google's official Node.js client library for ALL Google APIs (Drive, Calendar, Gmail, etc.). In NeuroMeet it's used exclusively for Google Drive.

**How it's used — authentication + upload:**
```typescript
import { google } from 'googleapis';

// Setup OAuth client (runs once on startup via onModuleInit):
this.oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
this.oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN, // long-lived server token
});
this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });

// Upload a file (simple, not chunked):
const response = await this.drive.files.create({
  requestBody: { name: 'document.pdf', parents: [folderId] },
  media: { mimeType: 'application/pdf', body: fileStream },
  fields: 'id, webViewLink',
});

// Set file permissions (make public):
await this.drive.permissions.create({
  fileId: response.data.id,
  requestBody: { role: 'reader', type: 'anyone' },
});
```

**The Resumable Upload session (for large video files):**
```typescript
// Step 1: Initialize a resumable upload session — get an upload URL
// (This is done manually via raw HTTPS in drive.service.ts
//  because googleapis SDK doesn't expose stream-friendly resumable upload)
const uploadUrl = await _initResumableSession(fileName, mimeType, folderId, accessToken);
// uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xyz'

// Step 2: PUT chunks to that URL
// PUT Content-Range: bytes 0-31457279/*     → response: 308 Resume Incomplete
// PUT Content-Range: bytes 31457280-62914559/* → response: 308 Resume Incomplete
// PUT Content-Range: bytes 62914560-80000000/80000000 → response: 200 OK + file metadata
```

**📖 Learn:**
- https://developers.google.com/drive/api/guides/manage-uploads
- https://developers.google.com/drive/api/guides/resumable-upload

---

### `resend` — v6.12.2
**What it is:** A modern transactional email API service. You send emails via their REST API — no SMTP configuration needed.

**How it's used:**
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP email:
await resend.emails.send({
  from: 'NeuroMeet <no-reply@neuromeet.anasdev.shop>',
  to: user.email,
  subject: 'Your verification code',
  html: `<p>Your code is: <strong>${code}</strong></p>`,
});
```

**Emails sent in NeuroMeet:**
- Signup OTP verification
- Password reset code
- Welcome email after verification
- Meeting scheduled notification
- Group invitation

**📖 Learn:** https://resend.com/docs

---

### `axios` — v1.16.0
**What it is:** An HTTP client library. Used to make HTTP requests FROM the backend to other services.

**How it's used:** Making requests to the LiveKit Dispatch API (the Python FastAPI service) to start/stop the AI bot.

```typescript
import axios from 'axios';

// Tell the AI bot dispatch server to start a bot for this room:
await axios.post(`${process.env.AI_BOT_URL}/api/dispatch`, {
  room_name: roomName,
  token: botToken,
  livekit_url: process.env.LIVEKIT_URL,
});
```

**📖 Learn:** https://axios-http.com/docs/intro

---

### `sharp` — v0.35.1
**What it is:** A high-performance image processing library. Resize, convert, compress images.

**How it's used:** Processing user avatar uploads — resize to standard dimensions before storing.

```typescript
import sharp from 'sharp';

const resized = await sharp(uploadedBuffer)
  .resize(200, 200)
  .jpeg({ quality: 85 })
  .toBuffer();
```

**📖 Learn:** https://sharp.pixelplumbing.com

---

## 7. Validation & Transformation

> Already covered under Authentication section — `class-validator` + `class-transformer`

### `dotenv` — v17
**What it is:** Loads environment variables from a `.env` file into `process.env`.

```typescript
// main.ts — must be the very first import:
import 'dotenv/config';

// Now process.env.JWT_SECRET is available everywhere
```

**📖 Learn:** https://github.com/motdotla/dotenv

---

## 8. Dev Tools & Testing

---

### `jest` + `ts-jest` + `@nestjs/testing` — v30 / v29 / v11
**What they are:**
- `jest` — the test runner and assertion library
- `ts-jest` — transformer so Jest can run TypeScript files
- `@nestjs/testing` — creates a mini NestJS app in tests with mocked providers

**How it's used — the one spec file that exists (`meetings.service.spec.ts`):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsService } from './meetings.service';

describe('MeetingsService', () => {
  let service: MeetingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        { provide: PrismaService, useValue: mockPrisma },  // mock the DB
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should create a meeting', async () => {
    mockPrisma.meeting.create.mockResolvedValue({ id: '123', title: 'Test' });
    const result = await service.createMeeting('hostId', { title: 'Test' });
    expect(result.status).toBe('success');
  });
});
```

**📖 Learn:** https://jestjs.io/docs/getting-started and https://docs.nestjs.com/fundamentals/testing

---

### `supertest` — v7
**What it is:** HTTP assertion library. Makes real HTTP requests against your NestJS app in tests.

```typescript
import * as request from 'supertest';

// In an e2e test:
request(app.getHttpServer())
  .post('/api/v1/auth/sign-in')
  .send({ email: 'test@test.com', password: 'password123' })
  .expect(200)
  .expect(res => {
    expect(res.body.access_token).toBeDefined();
  });
```

**📖 Learn:** https://github.com/ladjs/supertest

---

### `@nestjs/cli` + `@swc/core` + `@swc/cli`
**What they are:**
- `@nestjs/cli` — the `nest` command. `nest build`, `nest generate module meetings`
- `@swc/core` + `@swc/cli` — SWC is a Rust-based TypeScript transpiler. Much faster than `tsc`. Used with `nest build -b swc`.

---

### `typescript-eslint` + `eslint-plugin-prettier` + `prettier`
**What they are:**
- `prettier` — code formatter. Enforces consistent style (spacing, quotes, semicolons)
- `eslint-plugin-prettier` — runs Prettier as an ESLint rule so you see formatting issues in your editor
- `typescript-eslint` — ESLint rules specific to TypeScript

**📖 Learn:** https://prettier.io/docs/en/index.html

---

## 📊 Priority Learning Map

```
HIGH PRIORITY — the entire backend is built on these:
├── @nestjs/common + core    → DI, Modules, Controllers, Guards, Decorators
├── prisma + @prisma/client   → All database access
├── @nestjs/jwt               → JWT sign and verify
├── class-validator + class-transformer → DTO validation
└── @nestjs/platform-fastify  → HTTP engine

MEDIUM PRIORITY — important features:
├── @nestjs/schedule          → Cron jobs
├── @nestjs/event-emitter     → SSE pub/sub
├── @nestjs/throttler         → Rate limiting
├── livekit-server-sdk        → Room + token management
├── googleapis                → Drive upload pipeline
└── resend                    → Transactional emails

LOW PRIORITY — learn when you need them:
├── @fastify/multipart         → File upload handling
├── passport-google-oauth2    → OAuth flow
├── axios                     → HTTP client (call AI bot)
├── sharp                     → Image processing
├── rxjs                      → When you use @nestjs/axios
└── jest + supertest           → Testing
```

---

## 🔗 Quick Reference — All Official Docs

| Package | Docs URL |
|---|---|
| NestJS | https://docs.nestjs.com |
| Fastify | https://fastify.dev/docs |
| Prisma | https://www.prisma.io/docs |
| PostgreSQL tutorial | https://www.postgresql.org/docs/current/tutorial.html |
| @nestjs/jwt | https://docs.nestjs.com/security/authentication |
| class-validator | https://github.com/typestack/class-validator |
| @nestjs/schedule | https://docs.nestjs.com/techniques/task-scheduling |
| @nestjs/event-emitter | https://docs.nestjs.com/techniques/events |
| @nestjs/throttler | https://docs.nestjs.com/security/rate-limiting |
| @nestjs/config | https://docs.nestjs.com/techniques/configuration |
| LiveKit Server SDK | https://docs.livekit.io/realtime/server |
| Google Drive API | https://developers.google.com/drive/api/guides |
| Resend | https://resend.com/docs |
| Axios | https://axios-http.com/docs |
| Sharp | https://sharp.pixelplumbing.com |
| JWT.io (decoder) | https://jwt.io |
| Jest | https://jestjs.io/docs |
| Prettier | https://prettier.io/docs |
