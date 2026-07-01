import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('deve retornar status ok', () => {
      const result = appController.check();
      expect(result.status).toBe('ok');
    });

    it('deve retornar uptime como número', () => {
      const result = appController.check();
      expect(typeof result.uptime).toBe('number');
    });

    it('deve retornar timestamp como string ISO', () => {
      const result = appController.check();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
