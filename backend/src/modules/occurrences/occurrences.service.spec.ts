import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OccurrencesService } from './occurrences.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const OWNER_ID = 'user-uuid-1';
const OTHER_ID = 'user-uuid-2';
const OCC_ID = 'occ-uuid-1';

const rawOccurrence = {
  id: OCC_ID,
  type: OccurrenceType.shortage,
  description: 'Sem água há 3 dias',
  latitude: '-8.0476',
  longitude: '-34.877',
  city: 'Recife',
  photoUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  user: { id: OWNER_ID, name: 'João' },
  _count: { likes: 2, comments: 5 },
};

const mappedOccurrence = {
  id: OCC_ID,
  type: OccurrenceType.shortage,
  description: 'Sem água há 3 dias',
  latitude: -8.0476,
  longitude: -34.877,
  city: 'Recife',
  photoUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  user: { id: OWNER_ID, name: 'João' },
  likesCount: 2,
  commentsCount: 5,
};

const ownershipRow = { id: OCC_ID, userId: OWNER_ID };

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('OccurrencesService', () => {
  let service: OccurrencesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OccurrencesService,
        {
          provide: PrismaService,
          useValue: {
            occurrence: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OccurrencesService>(OccurrencesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('deve persistir a ocorrência com userId do token', async () => {
      (prisma.occurrence.create as jest.Mock).mockResolvedValue(rawOccurrence);

      const dto = {
        type: OccurrenceType.shortage,
        latitude: -8.0476,
        longitude: -34.877,
        city: 'Recife',
      };

      const result = await service.create(OWNER_ID, dto as any);

      expect(prisma.occurrence.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: OWNER_ID }) }),
      );
      expect(result.likesCount).toBe(2);
      expect(result.commentsCount).toBe(5);
      expect(result.user.id).toBe(OWNER_ID);
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('deve retornar lista paginada por cursor', async () => {
      (prisma.occurrence.findMany as jest.Mock).mockResolvedValue([rawOccurrence]);

      const result = await service.findAll({ limit: 10 });

      expect(prisma.occurrence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, orderBy: { createdAt: 'desc' } }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(mappedOccurrence);
    });

    it('deve aplicar skip e cursor quando cursor é fornecido', async () => {
      (prisma.occurrence.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAll({ cursor: OCC_ID, limit: 5 });

      expect(prisma.occurrence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: OCC_ID },
          take: 5,
        }),
      );
    });

    it('deve filtrar corretamente por type', async () => {
      (prisma.occurrence.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAll({ type: OccurrenceType.shortage });

      expect(prisma.occurrence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: OccurrenceType.shortage }) }),
      );
    });

    it('deve filtrar corretamente por city (insensitive)', async () => {
      (prisma.occurrence.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAll({ city: 'Recife' });

      expect(prisma.occurrence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ city: { contains: 'Recife', mode: 'insensitive' } }),
        }),
      );
    });
  });

  // ─── findForMap ───────────────────────────────────────────────────────────────

  describe('findForMap', () => {
    it('deve retornar apenas id, latitude, longitude e type', async () => {
      const mapRows = [
        { id: OCC_ID, latitude: '-8.0476', longitude: '-34.877', type: OccurrenceType.shortage },
      ];
      (prisma.occurrence.findMany as jest.Mock).mockResolvedValue(mapRows);

      const result = await service.findForMap();

      expect(prisma.occurrence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { id: true, latitude: true, longitude: true, type: true },
        }),
      );
      expect(result[0]).toEqual({
        id: OCC_ID,
        latitude: -8.0476,
        longitude: -34.877,
        type: OccurrenceType.shortage,
      });
    });
  });

  // ─── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('deve retornar ocorrência com likesCount e commentsCount', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(rawOccurrence);

      const result = await service.findById(OCC_ID);

      expect(prisma.occurrence.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: OCC_ID } }),
      );
      expect(result.likesCount).toBe(2);
      expect(result.commentsCount).toBe(5);
    });

    it('deve lançar NotFoundException se não encontrada', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nao-existe')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('deve atualizar a ocorrência do próprio usuário', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(ownershipRow);
      (prisma.occurrence.update as jest.Mock).mockResolvedValue({
        ...rawOccurrence,
        description: 'Atualizado',
      });

      const result = await service.update(OCC_ID, OWNER_ID, { description: 'Atualizado' });

      expect(prisma.occurrence.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: OCC_ID }, data: { description: 'Atualizado' } }),
      );
      expect(result).toBeDefined();
    });

    it('deve lançar NotFoundException se ocorrência não existe', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nao-existe', OWNER_ID, {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se usuário não é o dono', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(ownershipRow);

      await expect(service.update(OCC_ID, OTHER_ID, {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deve remover a ocorrência do próprio usuário', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(ownershipRow);
      (prisma.occurrence.delete as jest.Mock).mockResolvedValue(undefined);

      await service.remove(OCC_ID, OWNER_ID);

      expect(prisma.occurrence.delete).toHaveBeenCalledWith({ where: { id: OCC_ID } });
    });

    it('deve lançar NotFoundException se ocorrência não existe', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nao-existe', OWNER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se usuário não é o dono', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(ownershipRow);

      await expect(service.remove(OCC_ID, OTHER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
