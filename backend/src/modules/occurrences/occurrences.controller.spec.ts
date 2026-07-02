import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceType } from '@prisma/client';
import { LikesService } from './likes.service';
import { OccurrencesController } from './occurrences.controller';
import { OccurrencesService } from './occurrences.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const OWNER_ID = 'user-uuid-1';
const OCC_ID = 'occ-uuid-1';
const jwtPayload = { sub: OWNER_ID, email: 'joao@example.com' };

const mockOccurrence = {
  id: OCC_ID,
  type: OccurrenceType.shortage,
  description: 'Sem água há 3 dias',
  latitude: -8.0476,
  longitude: -34.877,
  city: 'Recife',
  photoUrl: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  likesCount: 0,
  commentsCount: 0,
  user: { id: OWNER_ID, name: 'João' },
};

const mockMapPin = {
  id: OCC_ID,
  latitude: -8.0476,
  longitude: -34.877,
  type: OccurrenceType.shortage,
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('OccurrencesController', () => {
  let controller: OccurrencesController;
  let occurrencesService: jest.Mocked<OccurrencesService>;
  let likesService: jest.Mocked<LikesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccurrencesController],
      providers: [
        {
          provide: OccurrencesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockOccurrence),
            findAll: jest.fn().mockResolvedValue([mockOccurrence]),
            findForMap: jest.fn().mockResolvedValue([mockMapPin]),
            findById: jest.fn().mockResolvedValue(mockOccurrence),
            update: jest.fn().mockResolvedValue({ ...mockOccurrence, description: 'Atualizado' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: LikesService,
          useValue: {
            toggle: jest.fn().mockResolvedValue({ liked: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<OccurrencesController>(OccurrencesController);
    occurrencesService = module.get(OccurrencesService);
    likesService = module.get(LikesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── POST /occurrences ──────────────────────────────────────────────────────

  describe('POST /occurrences', () => {
    it('deve chamar occurrencesService.create com userId e dto e retornar a ocorrência', async () => {
      const dto = { type: OccurrenceType.shortage, latitude: -8, longitude: -34, city: 'Recife' };

      const result = await controller.create(jwtPayload, dto as any);

      expect(occurrencesService.create).toHaveBeenCalledWith(jwtPayload.sub, dto);
      expect(result).toEqual(mockOccurrence);
    });
  });

  // ─── GET /occurrences ───────────────────────────────────────────────────────

  describe('GET /occurrences', () => {
    it('deve chamar occurrencesService.findAll e retornar lista', async () => {
      const filter = { limit: 10 };

      const result = await controller.findAll(filter as any);

      expect(occurrencesService.findAll).toHaveBeenCalledWith(filter);
      expect(result).toHaveLength(1);
    });
  });

  // ─── GET /occurrences/map ───────────────────────────────────────────────────

  describe('GET /occurrences/map', () => {
    it('deve chamar occurrencesService.findForMap e retornar pins do mapa', async () => {
      const result = await controller.findForMap();

      expect(occurrencesService.findForMap).toHaveBeenCalled();
      expect(result[0]).toEqual(mockMapPin);
    });
  });

  // ─── GET /occurrences/:id ───────────────────────────────────────────────────

  describe('GET /occurrences/:id', () => {
    it('deve chamar occurrencesService.findById e retornar a ocorrência', async () => {
      const result = await controller.findById(OCC_ID);

      expect(occurrencesService.findById).toHaveBeenCalledWith(OCC_ID);
      expect(result).toEqual(mockOccurrence);
    });
  });

  // ─── PATCH /occurrences/:id ─────────────────────────────────────────────────

  describe('PATCH /occurrences/:id', () => {
    it('deve chamar occurrencesService.update com id, userId e dto', async () => {
      const dto = { description: 'Atualizado' };

      const result = await controller.update(OCC_ID, jwtPayload, dto as any);

      expect(occurrencesService.update).toHaveBeenCalledWith(OCC_ID, jwtPayload.sub, dto);
      expect(result.description).toBe('Atualizado');
    });
  });

  // ─── DELETE /occurrences/:id ────────────────────────────────────────────────

  describe('DELETE /occurrences/:id', () => {
    it('deve chamar occurrencesService.remove com id e userId', async () => {
      await controller.remove(OCC_ID, jwtPayload);

      expect(occurrencesService.remove).toHaveBeenCalledWith(OCC_ID, jwtPayload.sub);
    });
  });

  // ─── POST /occurrences/:id/like ─────────────────────────────────────────────

  describe('POST /occurrences/:id/like', () => {
    it('deve chamar likesService.toggle com id e userId e retornar { liked }', async () => {
      const result = await controller.toggleLike(OCC_ID, jwtPayload);

      expect(likesService.toggle).toHaveBeenCalledWith(OCC_ID, jwtPayload.sub);
      expect(result).toEqual({ liked: true });
    });
  });
});
