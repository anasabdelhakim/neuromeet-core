import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
      const password = await bcrypt.hash(
        generateRandomPassword(),
        AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
      );

      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password,
          role: 'INSTRUCTOR', // ✅ Fixed: Matches your Prisma schema Enum
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

      const hashedRefreshToken = await bcrypt.hash(
        refresh_token,
        AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
      );

      await this.prisma.session.create({
        data: {
          userId: newUser.id,
          refreshToken: hashedRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
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

    const hashedRefreshToken = await bcrypt.hash(
      refresh_token,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const activeSessions = await this.prisma.session.count({ where: { userId: user.id } });
    if (activeSessions >= 3) {
      const oldestSession = await this.prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (oldestSession) {
        await this.prisma.session.delete({ where: { id: oldestSession.id } });
      }
    }

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
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
}
