// src/oauth/oauth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from './oauth.service';
import { GoogleAuthGuard } from './google-auth-gaurd'; // استيراد الجارد اللي عملناه

@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================
  // 1️⃣ Redirect to Google
  // =========================
  @Get('google/sign')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // هنسيبها فاضية.. Passport هيعمل Redirect لجوجل أوتوماتيك
  }

  // =========================
  // 2️⃣ Google Callback
  // =========================
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard) // الجارد ده هيجيب الداتا من جوجل ويحطها في req.user
  async googleCallback(@Req() req, @Res() reply: FastifyReply) {
    
    // الداتا اللي راجعة من GoogleStrategy
    const googleUser = req.user; 

    // تسجيل الدخول أو إنشاء الحساب في قاعدة البيانات
    const result = await this.authService.validateUser(googleUser);

    // =========================
    // Redirect to Frontend with tokens
    // =========================
    // هنوجه المستخدم للفرونت إند بتاعك ونبعتله التوكنز في الرابط
    const frontendUrl = 'http://localhost:3000'; // رابط الـ Next.js بتاعك
    
    // النتيجة اللي راجعة من السيرفيس فيها (access_token, refresh_token)
    const redirectUrl = `${frontendUrl}/auth/success?accessToken=${result.access_token}&refreshToken=${result.refresh_token}`;
    
return reply.status(302).redirect(redirectUrl);
  }
}
