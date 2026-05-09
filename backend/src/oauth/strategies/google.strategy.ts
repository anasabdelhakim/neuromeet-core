// src/oauth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:4000/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // تجهيز البيانات زي ما AuthService.validateUser عاوزها
    const user = {
      userId: profile.id,
      email: profile.email || profile.emails[0].value,
      name: profile.displayName,
      photo: profile.picture || profile.photos[0].value,
    };
    return user;
  }
}
