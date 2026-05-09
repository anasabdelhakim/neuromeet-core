import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/database.service';

const saltOrRounds = 12;

type UserData = {
  userId: string;
  email: string;
  name: string;
  photo: string;
};

// SECURITY: Generate a cryptographically secure random password for OAuth users.
// These users never need to know their password (they sign in via Google).
function generateRandomPassword(): string {
  return randomBytes(32).toString('base64');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userData: UserData): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    // ================= SIGN UP =================
    if (!user) {
      const password = await bcrypt.hash(
        generateRandomPassword(),
        saltOrRounds,
      );

      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password,
          role: 'USER',
        },
      });

      const payload = {
        _id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      const refresh_token = await this.jwtService.signAsync(
        { ...payload, countEx: 5 },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      // SECURITY: Strip password hash from response data.
      const { password: _, ...safeUser } = newUser;

      return {
        status: 200,
        message: 'User created successfully',
        data: safeUser,
        access_token: token,
        refresh_token,
      };
    }

    // ================= SIGN IN =================
    const payload = {
      _id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refresh_token = await this.jwtService.signAsync(
      { ...payload, countEx: 5 },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    // SECURITY: Strip password hash from response data.
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