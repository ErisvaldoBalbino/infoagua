import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { FilterOccurrencesDto } from './dto/filter-occurrences.dto';
import {
  OccurrenceMapPinDto,
  OccurrenceResponseDto,
} from './dto/occurrence-response.dto';

const OCCURRENCE_DETAIL_SELECT = {
  id: true,
  type: true,
  description: true,
  latitude: true,
  longitude: true,
  city: true,
  photoUrl: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

function mapToResponse(raw: {
  id: string;
  type: string;
  description: string | null;
  latitude: unknown;
  longitude: unknown;
  city: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string };
  _count: { likes: number; comments: number };
}): OccurrenceResponseDto {
  return {
    id: raw.id,
    type: raw.type as OccurrenceResponseDto['type'],
    description: raw.description,
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    city: raw.city,
    photoUrl: raw.photoUrl,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    likesCount: raw._count.likes,
    commentsCount: raw._count.comments,
    user: raw.user,
  };
}

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ─────────────────────────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateOccurrenceDto,
  ): Promise<OccurrenceResponseDto> {
    const raw = await this.prisma.occurrence.create({
      data: { ...dto, userId },
      select: OCCURRENCE_DETAIL_SELECT,
    });

    return mapToResponse(raw);
  }

  // ─── FindAll (cursor pagination) ────────────────────────────────────────────

  async findAll(filter: FilterOccurrencesDto): Promise<OccurrenceResponseDto[]> {
    const { type, city, cursor, limit = 20 } = filter;

    const rows = await this.prisma.occurrence.findMany({
      where: {
        ...(type && { type }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      select: OCCURRENCE_DETAIL_SELECT,
    });

    return rows.map(mapToResponse);
  }

  // ─── FindForMap ──────────────────────────────────────────────────────────────

  async findForMap(): Promise<OccurrenceMapPinDto[]> {
    const rows = await this.prisma.occurrence.findMany({
      select: { id: true, latitude: true, longitude: true, type: true },
    });

    return rows.map((r) => ({
      id: r.id,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      type: r.type,
    }));
  }

  // ─── FindById ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<OccurrenceResponseDto> {
    const raw = await this.prisma.occurrence.findUnique({
      where: { id },
      select: OCCURRENCE_DETAIL_SELECT,
    });

    if (!raw) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    return mapToResponse(raw);
  }

  // ─── Update ──────────────────────────────────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateOccurrenceDto,
  ): Promise<OccurrenceResponseDto> {
    // Atomic: ownership check and mutation in one statement
    const { count } = await this.prisma.occurrence.updateMany({
      where: { id, userId },
      data: dto,
    });

    if (count === 0) {
      // Diagnose 404 vs 403 — read-only lookup, mutation already guarded above
      const exists = await this.prisma.occurrence.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('Ocorrência não encontrada.');
      throw new ForbiddenException('Você não tem permissão para editar esta ocorrência.');
    }

    // Fetch full response shape after successful update
    const raw = await this.prisma.occurrence.findUnique({
      where: { id },
      select: OCCURRENCE_DETAIL_SELECT,
    });

    return mapToResponse(raw!);
  }

  // ─── Remove ──────────────────────────────────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<void> {
    // Atomic: ownership check and deletion in one statement
    const { count } = await this.prisma.occurrence.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      // Diagnose 404 vs 403 — read-only lookup, mutation already guarded above
      const exists = await this.prisma.occurrence.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('Ocorrência não encontrada.');
      throw new ForbiddenException('Você não tem permissão para remover esta ocorrência.');
    }
  }
}
