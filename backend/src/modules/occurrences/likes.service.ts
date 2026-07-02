import { Injectable, NotFoundException } from '@nestjs/common';
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
      await this.prisma.like.delete({
        where: { userId_occurrenceId: { userId, occurrenceId } },
      });
      return { liked: false };
    }

    // Like
    await this.prisma.like.create({
      data: { userId, occurrenceId },
    });
    return { liked: true };
  }
}
