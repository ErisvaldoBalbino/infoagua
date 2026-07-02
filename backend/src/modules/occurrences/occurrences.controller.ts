import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { FilterOccurrencesDto } from './dto/filter-occurrences.dto';
import {
  OccurrenceMapPinDto,
  OccurrenceResponseDto,
} from './dto/occurrence-response.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { LikesService, LikeToggleResult } from './likes.service';
import { OccurrencesService } from './occurrences.service';

@ApiTags('Occurrences')
@Controller('occurrences')
export class OccurrencesController {
  constructor(
    private readonly occurrencesService: OccurrencesService,
    private readonly likesService: LikesService,
  ) {}

  // ─── POST /occurrences ──────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Criar ocorrência' })
  @ApiResponse({ status: 201, type: OccurrenceResponseDto })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOccurrenceDto,
  ): Promise<OccurrenceResponseDto> {
    return this.occurrencesService.create(user.sub, dto);
  }

  // ─── GET /occurrences ───────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar ocorrências com filtros e paginação' })
  @ApiResponse({ status: 200, type: [OccurrenceResponseDto] })
  findAll(
    @Query() filter: FilterOccurrencesDto,
  ): Promise<OccurrenceResponseDto[]> {
    return this.occurrencesService.findAll(filter);
  }

  // ─── GET /occurrences/map ───────────────────────────────────────────────────
  // IMPORTANT: must be declared BEFORE :id to avoid route conflict

  @Get('map')
  @ApiOperation({ summary: 'Pins do mapa: id, lat, lng, type' })
  @ApiResponse({ status: 200, type: [OccurrenceMapPinDto] })
  findForMap(): Promise<OccurrenceMapPinDto[]> {
    return this.occurrencesService.findForMap();
  }

  // ─── GET /occurrences/:id ───────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe completo de uma ocorrência' })
  @ApiResponse({ status: 200, type: OccurrenceResponseDto })
  @ApiResponse({ status: 404, description: 'Ocorrência não encontrada' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OccurrenceResponseDto> {
    return this.occurrencesService.findById(id);
  }

  // ─── PATCH /occurrences/:id ─────────────────────────────────────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar própria ocorrência' })
  @ApiResponse({ status: 200, type: OccurrenceResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Ocorrência não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOccurrenceDto,
  ): Promise<OccurrenceResponseDto> {
    return this.occurrencesService.update(id, user.sub, dto);
  }

  // ─── DELETE /occurrences/:id ────────────────────────────────────────────────

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover própria ocorrência' })
  @ApiResponse({ status: 204, description: 'Removida com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Ocorrência não encontrada' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.occurrencesService.remove(id, user.sub);
  }

  // ─── POST /occurrences/:id/like ─────────────────────────────────────────────

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle like em uma ocorrência (curtir / descurtir)',
  })
  @ApiResponse({
    status: 200,
    description: '{ liked: true } ou { liked: false }',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 404, description: 'Ocorrência não encontrada' })
  toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeToggleResult> {
    return this.likesService.toggle(id, user.sub);
  }
}
