import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
const MAX_BODY_BYTES = 8 * 1024 * 1024 * 1024; 
const MULTIPART_LIMITS = {
  fieldNameSize: 200, 
  fieldSize: 1024 * 1024, 
  fields: 20, 
  fileSize: 500 * 1024 * 1024, 
  files: 5, 
  headerPairs: 2000,
};
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: MAX_BODY_BYTES,
    keepAliveTimeout: 620_000, 
    connectionTimeout: 0, 
    logger: {
      level: isProduction ? 'warn' : 'info',
    },
    disableRequestLogging: isProduction, 
  });
  await fastifyAdapter.register(fastifyMultipart as any, {
    limits: MULTIPART_LIMITS,
    attachFieldsToBody: false, // keep streaming behaviour; don't buffer into body
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      rawBody: true,
    },
  );
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addContentTypeParser(
    ['video/mp4', 'video/webm', 'application/octet-stream'],
    (request, payload, done) => {
      done(null, payload);
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.register(helmet as any, {
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
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 NeuroMeet API running on: http://localhost:${port}/api/v1`);
}
bootstrap();