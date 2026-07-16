import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicProfileDto } from './dto/public-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const FULL_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyStats(
    userId: string,
  ): Promise<{ reports: number; confirmations: number }> {
    const reports = await this.prisma.occurrence.count({
      where: { userId },
    });

    const confirmations = await this.prisma.like.count({
      where: {
        occurrence: { userId },
      },
    });

    return { reports, confirmations };
  }

  async findById(id: string): Promise<PublicProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: FULL_USER_SELECT,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException('Usuário não encontrado.');
      }
      throw error;
    }
  }
}
