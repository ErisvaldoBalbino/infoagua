import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommentsService } from './comments.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const OWNER_ID = 'user-uuid-1';
const OTHER_ID = 'user-uuid-2';
const OCC_ID = 'occ-uuid-1';
const COMMENT_ID = 'comment-uuid-1';

const rawComment = {
  id: COMMENT_ID,
  content: 'Ótima ocorrência!',
  createdAt: new Date('2026-01-01'),
  user: { id: OWNER_ID, name: 'João' },
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: {
            occurrence: {
              findUnique: jest.fn(),
            },
            comment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('deve criar comentário vinculado à ocorrência e ao usuário', async () => {
      (prisma.comment.create as jest.Mock).mockResolvedValue(rawComment);

      const result = await service.create(OCC_ID, OWNER_ID, {
        content: 'Ótima ocorrência!',
      });

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            occurrenceId: OCC_ID,
            userId: OWNER_ID,
          }),
        }),
      );
      expect(result.id).toBe(COMMENT_ID);
      expect(result.user.id).toBe(OWNER_ID);
    });

    it('deve lançar NotFoundException se ocorrência não existe', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '7.8.0',
        },
      );
      (prisma.comment.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        service.create('nao-existe', OWNER_ID, { content: 'Comentário' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── findByOccurrence ────────────────────────────────────────────────────────

  describe('findByOccurrence', () => {
    it('deve retornar lista de comentários ordenada por createdAt asc', async () => {
      const older = {
        ...rawComment,
        id: 'c1',
        createdAt: new Date('2026-01-01'),
      };
      const newer = {
        ...rawComment,
        id: 'c2',
        createdAt: new Date('2026-01-02'),
      };
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([older, newer]);

      const result = await service.findByOccurrence(OCC_ID);

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { occurrenceId: OCC_ID },
          orderBy: { createdAt: 'asc' },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('c1');
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deve remover comentário do próprio usuário', async () => {
      (prisma.comment.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await service.remove(COMMENT_ID, OWNER_ID);

      expect(prisma.comment.deleteMany).toHaveBeenCalledWith({
        where: { id: COMMENT_ID, userId: OWNER_ID },
      });
    });

    it('deve lançar NotFoundException se comentário não existe', async () => {
      (prisma.comment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.remove('nao-existe', OWNER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve lançar ForbiddenException se usuário não é o dono', async () => {
      (prisma.comment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: COMMENT_ID,
      });

      await expect(service.remove(COMMENT_ID, OTHER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
