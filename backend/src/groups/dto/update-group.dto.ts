import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  subject?: string;
}
