import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthResponse = {
  accessToken: 'mock.jwt.token',
  user: {
    id: 'uuid-1',
    name: 'José Silva',
    email: 'jose@example.com',
    createdAt: new Date('2026-01-01'),
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockAuthResponse),
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            me: jest.fn().mockResolvedValue(mockAuthResponse.user),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('POST /auth/register', () => {
    it('deve chamar authService.register e retornar AuthResponseDto', async () => {
      const dto = {
        name: 'José Silva',
        email: 'jose@example.com',
        password: 'senha123',
      };

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('POST /auth/login', () => {
    it('deve chamar authService.login e retornar AuthResponseDto', async () => {
      const dto = { email: 'jose@example.com', password: 'senha123' };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('GET /auth/me', () => {
    it('deve retornar usuário via @CurrentUser()', async () => {
      const jwtPayload = { sub: 'uuid-1', email: 'jose@example.com' };

      const result = await controller.me(jwtPayload);

      expect(authService.me).toHaveBeenCalledWith(jwtPayload.sub);
      expect(result).toEqual(mockAuthResponse.user);
    });
  });
});
