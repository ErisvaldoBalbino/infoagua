import { PrismaService } from './prisma.service';

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    service = new PrismaService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  it('deve expor onModuleInit como função', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('deve expor onModuleDestroy como função', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('deve chamar $connect no onModuleInit', async () => {
    const connectSpy = jest
      .spyOn(service, '$connect' as any)
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('deve chamar $disconnect no onModuleDestroy', async () => {
    const disconnectSpy = jest
      .spyOn(service, '$disconnect' as any)
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
