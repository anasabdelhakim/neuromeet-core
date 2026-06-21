import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
// Bun.password is a built-in global in Bun environments
import { AUTH_CONSTANTS } from 'src/auth/auth.constants'; 
import { PrismaService } from 'src/database/database.service';

type UserData = {
  userId: string;
  email: string;
  name: string;
  photo: string;
};

function generateRandomPassword(): string {
  return randomBytes(32).toString('base64');
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. ONLY finds or creates the user. NO JWTs generated here.
  async validateUser(userData: UserData): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user) {
      const password = await (Bun.password as any).hash(generateRandomPassword(), {
        algorithm: 'bcrypt',
        cost: 4,
      });

      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password,
          role: 'STUDENT', 
          avatarUrl: userData.photo, 
        },
        select: { id: true, email: true, name: true, role: true, created_at: true },
      });

      return { status: 200, message: 'User created successfully', data: newUser };
    }

    // Fire-and-forget avatar update
    this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: userData.photo },
    }).catch(err => this.logger.error(`Avatar update failed: ${err.message}`));

    const { password: _, ...safeUser } = user;
    return { status: 200, message: 'User logged in successfully', data: safeUser };
  }

  // 2. Generates the quick, temporary token for the URL redirect
  async generateHandoffToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { id: userId, purpose: 'handoff' }, 
      {
        secret: process.env.JWT_SECRET,
        expiresIn: AUTH_CONSTANTS.OAUTH_HANDOFF_TOKEN_EXPIRY, // Should be ~1 minute
      },
    );
  }

  // 3. The ONLY place where real tokens are generated
  async exchangeHandoffToken(handoffToken: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(handoffToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.purpose !== 'handoff') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      const tokenPayload = { id: user.id, email: user.email, role: user.role };

      const [access_token, refresh_token] = await Promise.all([
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

      const hashedRefreshToken = await (Bun.password as any).hash(refresh_token, {
        algorithm: 'bcrypt',
        cost: 10,
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return {
        status: 200,
        message: 'Tokens exchanged successfully',
        data: user,
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired handoff token');
    }
  }
}