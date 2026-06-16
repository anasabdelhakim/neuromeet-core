import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guard/auth.guard';
import { Roles } from './decorators/user.decorators';
import sharp from 'sharp';

@Controller('userMe')
export class UserMeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(['INSTRUCTOR', 'STUDENT'])
  @UseGuards(AuthGuard)
  getMe(@Req() req: any) {
    return this.userService.getMe(req.user);
  }

  @Patch()
  @Roles(['INSTRUCTOR', 'STUDENT'])
  @UseGuards(AuthGuard)
  updateMe(
    @Req() req: any,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMe(req.user, updateUserDto);
  }

  @Post('avatar')
  @Roles(['INSTRUCTOR', 'STUDENT'])
  @UseGuards(AuthGuard)
  async uploadAvatar(@Req() req: any) {
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }
    if (!data.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file is not a valid image');
    }
    const buffer = await data.toBuffer();

    const safeImageBuffer = await sharp(buffer)
      .resize({ width: 256, height: 256, fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const base64Str = safeImageBuffer.toString('base64');
    const avatarUrl = `data:image/webp;base64,${base64Str}`;
    return this.userService.updateMe(req.user, { avatarUrl, isProfileComplete: true });
  }

  @Delete()
  @Roles(['STUDENT'])
  @UseGuards(AuthGuard)
  deleteMe(@Req() req: any) {
    return this.userService.deleteMe(req.user);
  }
}
