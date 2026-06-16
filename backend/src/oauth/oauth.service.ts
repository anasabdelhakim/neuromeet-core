import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// Bun.password is a built-in global — no import needed.
import { randomBytes } from 'crypto';
import { AUTH_CONSTANTS } from 'src/auth/auth.constants'; // Make sure this path is correct
import { PrismaService } from 'src/database/database.service'; // Make sure this path is correct

type UserData = {
  userId: string;
  email: string;
  name: string;
  photo: string;
};

// SECURITY: Generate a cryptographically secure random password for OAuth users.
function generateRandomPassword(): string {
  return randomBytes(32).toString('base64');
}

@Injectable()
export class OAuthService {
  // ✅ Renamed to OAuthService to avoid DI collision
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userData: UserData): Promise<any> {
    // PERF: Only select what we need
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    // ================= SIGN UP =================
    if (!user) {
      const password = await Bun.password.hash(generateRandomPassword());

      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password,
          role: 'INSTRUCTOR', // ✅ Fixed: Matches your Prisma schema Enum
          avatarUrl: userData.photo, // ✅ Save Google profile picture
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          created_at: true, // ✅ Fixed: Matches your Prisma schema column
        },
      });

      const payload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      // PERF: Generate both tokens in parallel
      const [token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY,
        }),
        this.jwtService.signAsync(
          { ...payload, countEx: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_USES },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY,
          },
        ),
      ]);

      const hashedRefreshToken = await Bun.password.hash(refresh_token);

      await this.prisma.user.update({
        where: { id: newUser.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        status: 200,
        message: 'User created successfully',
        data: newUser,
        access_token: token,
        refresh_token,
      };
    }

    // ================= SIGN IN =================
    // Update their avatar URL in case they changed it on Google
    await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: userData.photo },
    });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const [token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY,
      }),
      this.jwtService.signAsync(
        { ...payload, countEx: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_USES },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY,
        },
      ),
    ]);

    const hashedRefreshToken = await Bun.password.hash(refresh_token);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const { password: _, ...safeUser } = user;

    return {
      status: 200,
      message: 'User logged in successfully',
      data: safeUser,
      access_token: token,
      refresh_token,
    };
  }
  async generateHandoffToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { id: userId, purpose: 'handoff' }, // SECURITY: Added purpose to prevent Token Confusion
      {
        secret: process.env.JWT_SECRET,
        expiresIn: AUTH_CONSTANTS.OAUTH_HANDOFF_TOKEN_EXPIRY,
      },
    );
  }

  async exchangeHandoffToken(handoffToken: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(handoffToken, {
        secret: process.env.JWT_SECRET,
      });

      // SECURITY: Reject any token that wasn't specifically generated for handoff
      if (payload.purpose !== 'handoff') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate the final access_token and refresh_token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const [token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(tokenPayload, {
          secret: process.env.JWT_SECRET,
          expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY,
        }),
        this.jwtService.signAsync(
          { ...tokenPayload, countEx: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_USES },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY,
          },
        ),
      ]);

      const hashedRefreshToken = await Bun.password.hash(refresh_token);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        status: 200,
        message: 'Tokens exchanged successfully',
        data: user,
        access_token: token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired handoff token');
    }
  }
}