import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { Transport } from '@nestjs/microservices';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';

// ─── Constants ────────────────────────────────────────────────────────────────
// 8 GB hard cap on any single upload body.
// Google Drive resumable sessions handle the actual chunking,
// so this is just the Fastify gateway limit — it will never
// hold 8 GB in RAM; the stream passes straight through.
const MAX_BODY_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB

// Multipart field / file limits (used for regular file uploads, NOT recording stream)
const MULTIPART_LIMITS = {
  fieldNameSize: 200, // max field name length (bytes)
  fieldSize: 1024 * 1024, // max non-file field value: 1 MB
  fields: 20, // max non-file fields per request
  fileSize: 500 * 1024 * 1024, // max single file via multipart: 500 MB
  files: 5, // max files per multipart request
  headerPairs: 2000,
};

async function bootstrap() {
  // ── 1. Fastify adapter with body limit ────────────────────────────────────
  // bodyLimit must be set here on the adapter, NOT on individual routes,
  // because Fastify reads the limit before routing.
  const isProduction = process.env.NODE_ENV === 'production';

  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: MAX_BODY_BYTES,
    // Keep-alive helps long-running recording streams stay connected
    keepAliveTimeout: 620_000, // 620 seconds (10 min + buffer)
    connectionTimeout: 0, // no connection timeout for streaming routes
    // Structured pino logging — zero overhead at 'warn', catches crashes
    logger: {
      level: isProduction ? 'warn' : 'info',
    },
    disableRequestLogging: isProduction, // Skip per-request logs in prod
  });

  // ── 2. Multipart (for material uploads, profile pics, etc.) ──────────────
  // We pass limits here so @fastify/multipart enforces them
  // BEFORE the data hits NestJS. The recording stream endpoint
  // bypasses multipart entirely (raw body stream).
  await fastifyAdapter.register(fastifyMultipart as any, {
    limits: MULTIPART_LIMITS,
    attachFieldsToBody: false, // keep streaming behaviour; don't buffer into body
  });

  // ── 3. Create the NestJS app ──────────────────────────────────────────────
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      // Disable built-in body parser for raw routes.
      // The recording controller reads req.raw directly.
      rawBody: true,
    },
  );

  const fastify = app.getHttpAdapter().getInstance();

  // بنقول لفاستيفاي: أي فيديو يجيلك، مررهولي كـ Stream من غير ما تحاول تحلله
  fastify.addContentTypeParser(
    ['video/mp4', 'video/webm', 'application/octet-stream'],
    (request, payload, done) => {
      done(null, payload);
    },
  );
  // ── 4. Global validation pipe ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── 5. Security & session middleware ─────────────────────────────────────
  await app.register(helmet as any, {
    // CSP must allow Google APIs for Drive embed playback
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'https://www.googleapis.com',
          'https://livekit.io',
        ],
        frameSrc: ["'self'", 'https://drive.google.com'],
        mediaSrc: ["'self'", 'https://drive.google.com'],
      },
    },
  });

  await app.register(fastifyCookie as any);

  // ── 6. Redis microservice (Disabled for In-Memory setup) ────────────────
  /*
  (app as any).connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    },
  });
  await app.startAllMicroservices();
  */

  // ── 7. CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ── 8. Global prefix & listen ─────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 NeuroMeet API running on: http://localhost:${port}/api/v1`);
  console.log(`📦 Max upload body: ${MAX_BODY_BYTES / 1024 / 1024 / 1024} GB`);
  console.log(
    `🎬 Recording stream endpoint: POST /api/v1/drive/recording/stream/:meetingId`,
  );
}

bootstrap();