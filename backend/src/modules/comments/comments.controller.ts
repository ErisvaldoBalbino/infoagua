import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // ─── POST /occurrences/:id/comments ─────────────────────────────────────────

  @Post('occurrences/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Comentar em uma ocorrência' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 404, description: 'Ocorrência não encontrada' })
  create(
    @Param('id', ParseUUIDPipe) occurrenceId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(occurrenceId, user.sub, dto);
  }

  // ─── GET /occurrences/:id/comments ──────────────────────────────────────────

  @Get('occurrences/:id/comments')
  @ApiOperation({ summary: 'Listar comentários de uma ocorrência' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  findByOccurrence(
    @Param('id', ParseUUIDPipe) occurrenceId: string,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findByOccurrence(occurrenceId);
  }

  // ─── DELETE /comments/:id ────────────────────────────────────────────────────

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover próprio comentário' })
  @ApiResponse({ status: 204, description: 'Removido com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.commentsService.remove(id, user.sub);
  }
}
