import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { OAuthService } from './oauth.service';
import { GoogleAuthGuard } from './google-auth-gaurd';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class OAuthController {
  constructor(private readonly authService: OAuthService) {}

  // =========================
  // 1️⃣ Redirect to Google
  // =========================

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Get('google/sign')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return { msg: 'Initiating Google Authentication' };
  }

  // =========================
  // 2️⃣ Google Callback
  // =========================

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(
    // ✅ FIX 1: Tell TS that Passport attaches a 'user' object to the request
    @Req() req: FastifyRequest & { user: any },
    @Res() res: FastifyReply,
  ) {
    // Now TypeScript knows req.user exists!
    const userObj = req.user;

    const user = {
      userId: userObj.profile.id,
      email: userObj.profile.emails[0].value,
      name: userObj.profile.displayName,
      photo: userObj.profile.photos[0].value,
    };

    try {
      // Validate the user and generate JWT tokens
      const tokens = await this.authService.validateUser(user);
      const isProd = process.env.NODE_ENV === 'production';

      // =========================
      // Secure Token Delivery (Fastify Syntax)
      // =========================
      res.setCookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour (in seconds)
        path: '/',
      });

      res.setCookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
        path: '/',
      });

      // SECURITY: Redirect cleanly to the frontend.

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Fastify Redirect Syntax
      return res.status(302).redirect(frontendUrl);
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      return res.status(500).send({
        message: 'Internal server error during OAuth callback',
        error: error.message,
      });
    }
  }
}
