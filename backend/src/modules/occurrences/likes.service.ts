import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface LikeToggleResult {
  liked: boolean;
}

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Toggle ─────────────────────────────────────────────────────────────────

  async toggle(
    occurrenceId: string,
    userId: string,
  ): Promise<LikeToggleResult> {
    // Verify occurrence exists
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      select: { id: true },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    // Check if like already exists
    const existing = await this.prisma.like.findUnique({
      where: { userId_occurrenceId: { userId, occurrenceId } },
      select: { userId: true },
    });

    if (existing) {
      // Unlike
      try {
        await this.prisma.like.delete({
          where: { userId_occurrenceId: { userId, occurrenceId } },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          // Already unliked
          return { liked: false };
        }
        throw error;
      }
      return { liked: false };
    }

    // Like
    try {
      await this.prisma.like.create({
        data: { userId, occurrenceId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Already liked
          return { liked: true };
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Ocorrência não encontrada.');
        }
      }
      throw error;
    }
    return { liked: true };
  }
}
