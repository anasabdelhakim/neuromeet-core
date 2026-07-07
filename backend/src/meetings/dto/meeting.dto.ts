import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsBoolean,
  IsPositive,
  MinLength,
  MaxLength,
} from 'class-validator';
export enum MeetingStatusDto {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}
export enum MeetingPlatformDto {
  NEUROMEET = 'NEUROMEET',
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
}
export enum ParticipantRoleDto {
  HOST = 'HOST',
  CO_HOST = 'CO_HOST',
  PARTICIPANT = 'PARTICIPANT',
  OBSERVER = 'OBSERVER',
}
export class CreateMeetingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
  @IsOptional()
  @IsEnum(MeetingPlatformDto)
  platform?: MeetingPlatformDto;
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMinutes?: number;
  @IsOptional()
  @IsString()
  groupId?: string;
}
export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
  @IsOptional()
  @IsEnum(MeetingStatusDto)
  status?: MeetingStatusDto;
  @IsOptional()
  @IsEnum(MeetingPlatformDto)
  platform?: MeetingPlatformDto;
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMinutes?: number;
  @IsOptional()
  @IsString()
  livekitRoomName?: string;
  @IsOptional()
  @IsString()
  livekitRoomSid?: string;
  @IsOptional()
  @IsString()
  joinToken?: string;
}
export class JoinMeetingDto {
  @IsString()
  passcode: string;
  @IsOptional()
  @IsBoolean()
  consentGiven?: boolean;
}
export class UpdateParticipantDto {
  @IsOptional()
  @IsInt()
  secondsPresent?: number;
  @IsOptional()
  avgEngagementScore?: number;
  @IsOptional()
  @IsBoolean()
  adhdFlagged?: boolean;
}
export class AddMaterialDto {
  @IsString()
  fileName: string;
  @IsOptional()
  @IsString()
  driveFileId?: string;
  @IsOptional()
  @IsString()
  driveViewUrl?: string;
  @IsOptional()
  @IsString()
  mimeType?: string;
  @IsOptional()
  @IsInt()
  @IsPositive()
  sizeBytes?: number;
}
