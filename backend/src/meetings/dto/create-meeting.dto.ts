import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isInstant?: boolean;

  @IsBoolean()
  @IsOptional()
  isGroupLocked?: boolean;

  @IsString()
  @IsOptional()
  groupId?: string;
}
