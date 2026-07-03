import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
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

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockPublicUser),
            updateMe: jest
              .fn()
              .mockResolvedValue({ ...mockFullUser, name: 'Novo Nome' }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── GET /users/:id ───────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('deve retornar PublicProfileDto (sem email) para usuário existente', async () => {
      const result = await controller.findById(mockPublicUser.id);

      expect(usersService.findById).toHaveBeenCalledWith(mockPublicUser.id);
      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('email');
    });
  });

  // ─── PATCH /users/me ─────────────────────────────────────────────────────

  describe('PATCH /users/me', () => {
    it('deve usar @CurrentUser() para identificar o usuário e atualizar o perfil', async () => {
      const jwtPayload = { sub: 'uuid-1', email: 'jose@example.com' };
      const dto = { name: 'Novo Nome' };

      const result = await controller.updateMe(jwtPayload, dto);

      expect(usersService.updateMe).toHaveBeenCalledWith(jwtPayload.sub, dto);
      expect(result.name).toBe('Novo Nome');
    });
  });
});
