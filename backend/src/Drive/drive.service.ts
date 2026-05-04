import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class DriveTestService implements OnModuleInit {
  private drive: drive_v3.Drive;

  onModuleInit() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // ==========================================
  // 1. دالة التست (رفع ملف نصي وهمي)
  // ==========================================
  async testUpload() {
    try {
      const fileMetadata = {
        name: 'NeuroMeet-Test-OAuth.txt',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string],
      };

      const media = {
        mimeType: 'text/plain',
        body: Readable.from([
          'Hello NeuroMeet! الرفع اشتغل بالـ 5 تيرا مباشرة وبدون أي ليميت!',
        ]),
      };

      const response = (await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      })) as any;

      return {
        message: 'تم الرفع بنجاح على مساحتك الشخصية يا هندسة!',
        fileId: response.data.id,
        link: response.data.webViewLink,
      };
    } catch (error: any) {
      console.error('إيرور في الرفع:', error.message);
      return { error: 'حصلت مشكلة في الرفع، راجع الـ Console' };
    }
  }

  // ==========================================
  // 2. دالة رفع الصور والملفات الحقيقية (Fastify Compatible)
  // ==========================================
  async uploadImage(fileData: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }) {
    try {
      const fileMetadata = {
        name: fileData.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string],
      };

      const media = {
        mimeType: fileData.mimetype,
        body: Readable.from(fileData.buffer), // بنقرأ الـ Buffer اللي جاي من Fastify
      };

      const response = (await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      })) as any;

      return {
        message: 'تم رفع الصورة الحقيقية بنجاح عبر Fastify يا هندسة! 🚀',
        fileId: response.data.id,
        link: response.data.webViewLink,
      };
    } catch (error: any) {
      console.error('إيرور في رفع الصورة:', error.message);
      return { error: 'حصلت مشكلة في رفع الصورة، راجع الكونسول' };
    }
  }
}
