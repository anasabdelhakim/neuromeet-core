import { Controller, Get, Req, Res, UseGuards, Post, Body } from '@nestjs/common';
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
      photo: userObj.profile.picture || userObj.profile.photos?.[0]?.value || userObj.profile._json?.picture || '',
    };

    try {
      // Validate the user and generate JWT tokens
      const result = await this.authService.validateUser(user);
      
      // Generate a short-lived "handoffToken" (1-minute expiry)
      const handoffToken = await this.authService.generateHandoffToken(result.data.id);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Redirect user to the frontend with the handoff token
      return res.status(302).redirect(`${frontendUrl}/api/auth/oauth-callback?token=${handoffToken}`);
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      return res.status(500).send({
        message: 'Internal server error during OAuth callback',
        error: error.message,
      });
    }
  }

  // =========================
  // 3️⃣ Exchange Handoff Token for Real Tokens
  // =========================
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('google/exchange')
  async googleExchange(@Body('token') token: string) {
    return this.authService.exchangeHandoffToken(token);
  }
}
