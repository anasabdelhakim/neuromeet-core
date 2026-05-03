import {
  Controller,
  Get,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { DriveTestService } from './drive.service';

@Controller('drive')
export class DriveTestController {
  constructor(private readonly driveTestService: DriveTestService) {}

  // GET: http://localhost:4000/api/v1/drive/test
  @Get('test')
  async runTest() {
    return this.driveTestService.testUpload();
  }

  // POST: http://localhost:4000/api/v1/drive/upload-image
  @Post('upload-image')
  async uploadFile(@Req() req: FastifyRequest) {
    // استخراج الملف باستخدام Fastify Multipart
    const file = await req.file();

    if (!file) {
      throw new BadRequestException(
        'مفيش صورة اتبعتت! اتأكد من الـ Body في Postman (form-data)',
      );
    }

    // تحويل الملف لـ Buffer للتعامل معه في الـ Service
    const buffer = await file.toBuffer();

    const fileData = {
      originalname: file.filename,
      mimetype: file.mimetype,
      buffer: buffer,
    };

    return this.driveTestService.uploadImage(fileData);
  }
}
