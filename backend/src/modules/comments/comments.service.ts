import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

const COMMENT_SELECT = {
  id: true,
  content: true,
  createdAt: true,
  user: { select: { id: true, name: true } },
} as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ─────────────────────────────────────────────────────────────────

  async create(
    occurrenceId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    // Verify occurrence exists before creating the comment
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id: occurrenceId },
      select: { id: true },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    const comment = await this.prisma.comment.create({
      data: { content: dto.content, occurrenceId, userId },
      select: COMMENT_SELECT,
    });

    return comment;
  }

  // ─── FindByOccurrence ────────────────────────────────────────────────────────

  async findByOccurrence(occurrenceId: string): Promise<CommentResponseDto[]> {
    const comments = await this.prisma.comment.findMany({
      where: { occurrenceId },
      orderBy: { createdAt: 'asc' },
      select: COMMENT_SELECT,
    });

    return comments;
  }

  // ─── Remove ──────────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    // Atomic: ownership check and deletion in one statement
    const { count } = await this.prisma.comment.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      // Diagnose 404 vs 403 — read-only lookup, mutation already guarded above
      const exists = await this.prisma.comment.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('Comentário não encontrado.');
      throw new ForbiddenException(
        'Você não tem permissão para remover este comentário.',
      );
    }
  }
}
