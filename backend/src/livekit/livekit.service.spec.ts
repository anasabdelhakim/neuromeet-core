import { Test, TestingModule } from '@nestjs/testing';
import { LivekitService } from './livekit.service';
import { PrismaService } from '../database/database.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config(); // Needed to load env vars for AccessToken if used natively

describe('LivekitService', () => {
  let service: LivekitService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Set dummy env variables for AccessToken creation
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret-12345678901234567890123456789012';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LivekitService,
        {
          provide: PrismaService,
          useValue: {
            meeting: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LivekitService>(LivekitService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should throw UnauthorizedException if meeting not found', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createToken('invalid-room', 'user1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if meeting is ENDED', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue({
        status: 'ENDED',
      });

      await expect(service.createToken('ended-room', 'user1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if meeting is CANCELLED', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue({
        status: 'CANCELLED',
      });

      await expect(service.createToken('cancelled-room', 'user1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException if meeting is SCHEDULED and user is STUDENT', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue({
        status: 'SCHEDULED',
      });

      await expect(
        service.createToken('scheduled-room', 'student1', 'STUDENT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return a token if meeting is SCHEDULED and user is INSTRUCTOR (host)', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue({
        status: 'SCHEDULED',
      });

      const token = await service.createToken('scheduled-room', 'inst1', 'INSTRUCTOR');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should return a token if meeting is LIVE and user is STUDENT', async () => {
      (prisma.meeting.findFirst as jest.Mock).mockResolvedValue({
        status: 'LIVE',
      });

      const token = await service.createToken('live-room', 'student1', 'STUDENT');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
