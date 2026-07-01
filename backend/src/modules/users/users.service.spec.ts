import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from './users.service';

const mockUser = {
  id: 'uuid-1',
  name: 'José Silva',
  email: 'jose@example.com',
  createdAt: new Date('2026-01-01'),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('deve retornar usuário existente', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockUser.id } }),
      );
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se usuário não encontrado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('uuid-nao-existe')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ─── updateMe ─────────────────────────────────────────────────────────────

  describe('updateMe', () => {
    it('deve atualizar o name do usuário correto', async () => {
      const updated = { ...mockUser, name: 'Novo Nome' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateMe(mockUser.id, { name: 'Novo Nome' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { name: 'Novo Nome' },
        }),
      );
      expect(result.name).toBe('Novo Nome');
    });
  });
});
