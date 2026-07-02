import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LikesService } from './likes.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const USER_ID = 'user-uuid-1';
const OCC_ID = 'occ-uuid-1';

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('LikesService', () => {
  let service: LikesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaService,
          useValue: {
            occurrence: {
              findUnique: jest.fn(),
            },
            like: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── toggle ──────────────────────────────────────────────────────────────────

  describe('toggle', () => {
    it('deve criar like se não existe (curtir)', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue({ id: OCC_ID });
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.like.create as jest.Mock).mockResolvedValue({ userId: USER_ID, occurrenceId: OCC_ID });

      const result = await service.toggle(OCC_ID, USER_ID);

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { userId: USER_ID, occurrenceId: OCC_ID },
      });
      expect(prisma.like.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ liked: true });
    });

    it('deve remover like se já existe (descurtir)', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue({ id: OCC_ID });
      (prisma.like.findUnique as jest.Mock).mockResolvedValue({ userId: USER_ID });
      (prisma.like.delete as jest.Mock).mockResolvedValue({ userId: USER_ID, occurrenceId: OCC_ID });

      const result = await service.toggle(OCC_ID, USER_ID);

      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { userId_occurrenceId: { userId: USER_ID, occurrenceId: OCC_ID } },
      });
      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(result).toEqual({ liked: false });
    });

    it('deve lançar NotFoundException se ocorrência não existe', async () => {
      (prisma.occurrence.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.toggle('nao-existe', USER_ID)).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.like.findUnique).not.toHaveBeenCalled();
      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(prisma.like.delete).not.toHaveBeenCalled();
    });
  });
});
