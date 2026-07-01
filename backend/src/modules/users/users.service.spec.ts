import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from './users.service';

const mockPublicUser = {
  id: 'uuid-1',
  name: 'José Silva',
  createdAt: new Date('2026-01-01'),
};

const mockFullUser = {
  ...mockPublicUser,
  email: 'jose@example.com',
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
    it('deve retornar perfil público sem email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPublicUser);

      const result = await service.findById(mockPublicUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockPublicUser.id } }),
      );
      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('email');
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
    it('deve atualizar o name do usuário correto e retornar perfil completo (com email)', async () => {
      const updated = { ...mockFullUser, name: 'Novo Nome' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateMe(mockFullUser.id, { name: 'Novo Nome' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockFullUser.id },
          data: { name: 'Novo Nome' },
        }),
      );
      expect(result.name).toBe('Novo Nome');
      expect(result).toHaveProperty('email');
    });

    it('deve lançar NotFoundException quando Prisma retorna P2025 (registro não existe)', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(
        service.updateMe('uuid-nao-existe', { name: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

