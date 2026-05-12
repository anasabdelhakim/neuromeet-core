import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../database/database.service';
import { JwtConfigModule } from '../auth/jwt.config';
import { APIFeatures } from '../utils/apiFeatures';
import * as bcrypt from 'bcrypt';
import { Role } from '../../lib/prisma/_generated/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const password = await bcrypt.hash(createUserDto.password, 12);

    const ifUserExist = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (ifUserExist) throw new HttpException('user already exist', 400);

    const createdUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password,
        role: createUserDto.role ?? Role.USER,
        active: true,
      },
    });

    return {
      status: 201,
      data: createdUser,
    };
  }

  async findAll(query: any) {
  const features = new APIFeatures(query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const users = await this.prisma.user.findMany({
    ...features.getQuery(),
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      created_at: true,
    },
  });

  if (!users.length)
    return new NotFoundException('not found any users');

  return {
    status: 200,
    result: users.length,
    data: { users },
  };
}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    if (!user) return new NotFoundException('user not found');

    return {
      status: 200,
      data: { user },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return new NotFoundException('user not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        12,
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      status: 'success',
      data: { user },
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    if (!user) return new NotFoundException('user not found');

    return {
      status: 'success',
      data: null,
    };
  }

  async getMe(payload: any) {
    if (!payload.id)
      throw new NotFoundException('user not found');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    return {
      status: 'success',
      data: { user },
    };
  }

  async updateMe(payload: any, updateUserDto: UpdateUserDto) {
    if (!payload.id)
      throw new NotFoundException('user not found');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) throw new NotFoundException('user not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        12,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: payload.id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        created_at: true,
      },
    });

    return {
      status: 'success',
      data: updatedUser,
    };
  }

  async deleteMe(payload: any): Promise<void> {
    if (!payload.id)
      throw new NotFoundException('user not found');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) throw new NotFoundException('user not found');

    await this.prisma.user.delete({
      where: { id: payload.id },
    });

  }
}