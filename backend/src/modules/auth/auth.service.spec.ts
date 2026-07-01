import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from './auth.service';

// Mock bcrypt to avoid real hashing in unit tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'uuid-1',
  name: 'José Silva',
  email: 'jose@example.com',
  passwordHash: 'hashed_password',
  createdAt: new Date('2026-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── register ────────────────────────────────────────────────────────────

  describe('register', () => {
    it('deve criar usuário, hashear senha e retornar token', async () => {
      const createMock = jest.fn().mockResolvedValue({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      (prisma.user.create as jest.Mock) = createMock;

      const result = await service.register({
        name: mockUser.name,
        email: mockUser.email,
        password: 'senha123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: mockUser.email }),
        }),
      );
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('deve lançar ConflictException quando e-mail já existe (P2002)', async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          name: 'Outro',
          email: mockUser.email,
          password: 'senha123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────

  describe('login', () => {
    it('deve retornar token com credenciais válidas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: mockUser.email,
        password: 'senha123',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('deve lançar UnauthorizedException se e-mail não existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@example.com', password: 'abc' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se senha está errada', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'senhaErrada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  // ─── me ──────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('deve retornar dados do usuário sem passwordHash', async () => {
      const userData = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      };
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(userData);

      const result = await service.me(mockUser.id);

      expect(result).toEqual(userData);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
