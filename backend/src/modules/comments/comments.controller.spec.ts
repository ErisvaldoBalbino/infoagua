import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const OWNER_ID = 'user-uuid-1';
const OCC_ID = 'occ-uuid-1';
const COMMENT_ID = 'comment-uuid-1';
const jwtPayload = { sub: OWNER_ID, email: 'joao@example.com' };

const mockComment = {
  id: COMMENT_ID,
  content: 'Ótima ocorrência!',
  createdAt: new Date('2026-01-01'),
  user: { id: OWNER_ID, name: 'João' },
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockComment),
            findByOccurrence: jest.fn().mockResolvedValue([mockComment]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get(CommentsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── POST /occurrences/:id/comments ─────────────────────────────────────────

  describe('POST /occurrences/:id/comments', () => {
    it('deve chamar commentsService.create com occurrenceId, userId e dto', async () => {
      const dto = { content: 'Ótima ocorrência!' };

      const result = await controller.create(OCC_ID, jwtPayload, dto);

      expect(commentsService.create).toHaveBeenCalledWith(
        OCC_ID,
        jwtPayload.sub,
        dto,
      );
      expect(result).toEqual(mockComment);
    });
  });

  // ─── GET /occurrences/:id/comments ──────────────────────────────────────────

  describe('GET /occurrences/:id/comments', () => {
    it('deve chamar commentsService.findByOccurrence e retornar lista', async () => {
      const result = await controller.findByOccurrence(OCC_ID);

      expect(commentsService.findByOccurrence).toHaveBeenCalledWith(OCC_ID);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockComment);
    });
  });

  // ─── DELETE /comments/:id ────────────────────────────────────────────────────

  describe('DELETE /comments/:id', () => {
    it('deve chamar commentsService.remove com id e userId', async () => {
      await controller.remove(COMMENT_ID, jwtPayload);

      expect(commentsService.remove).toHaveBeenCalledWith(
        COMMENT_ID,
        jwtPayload.sub,
      );
    });
  });
});
