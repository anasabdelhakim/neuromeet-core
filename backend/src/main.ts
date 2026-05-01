import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // إعدادات الـ CORS عشان تسمح للـ Frontend يكلم الباك إند
  app.enableCors({
    origin: 'http://localhost:3000', // لينك الـ Next.js بتاعك
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0'); // الـ 0.0.0.0 دي مهمة عشان لو جربت من الموبايل أو أي جهاز تاني في الشبكة

  // شلنا الـ } الزيادة اللي كانت في الآخر
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
