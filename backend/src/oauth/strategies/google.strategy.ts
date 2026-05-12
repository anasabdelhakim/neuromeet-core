import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // W7: Use environment variable for the callback URL so it works in all environments.
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      // W2: Enable state parameter to protect against CSRF on the OAuth callback.
      state: true,
    });
  }

  // This method will be called after successful authentication with Google.
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      accessToken,
      refreshToken,
      profile,
    };
    return user;
  }
}
