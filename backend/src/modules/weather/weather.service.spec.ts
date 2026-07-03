import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { LRUCache } from 'lru-cache';
import { WeatherService } from './weather.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as any,
  };
}

const OW_FORECAST_STUB = {
  list: [
    {
      dt: 1751472000, // 2026-07-02T12:00:00Z
      main: { temp: 22.3 },
      weather: [{ description: 'chuva leve', icon: '10d' }],
      pop: 0.68,
    },
  ],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: jest.Mocked<Pick<HttpService, 'get'>>;
  let configGet: jest.Mock;

  beforeEach(async () => {
    const httpMock = { get: jest.fn() };
    configGet = jest.fn().mockReturnValue('fake-api-key');
    const configMock = { get: configGet };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = httpMock;
  });

  // ─── getForecast — sucesso ────────────────────────────────────────────────

  it('getForecast — retorna WeatherResponseDto com dados mapeados da OpenWeather', async () => {
    httpService.get.mockReturnValue(of(makeAxiosResponse(OW_FORECAST_STUB)));

    const result = await service.getForecast(-23.5, -46.6);

    expect(result).toMatchObject({
      temperature: 22.3,
      description: 'chuva leve',
      rainProbability: 0.68,
      icon: '10d',
      datetime: new Date(1751472000 * 1000).toISOString(),
    });

    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('lat=-23.5'),
    );
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('lon=-46.6'),
    );
    expect(httpService.get).toHaveBeenCalledWith(
      expect.stringContaining('fake-api-key'),
    );
  });

  // ─── getForecast — falha externa ─────────────────────────────────────────

  it('getForecast — lança ServiceUnavailableException se a API externa falhar', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('Network Error')),
    );

    await expect(service.getForecast(-23.5, -46.6)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  // ─── getForecast — lista vazia ────────────────────────────────────────────

  it('getForecast — lança ServiceUnavailableException quando list está vazia', async () => {
    httpService.get.mockReturnValue(of(makeAxiosResponse({ list: [] })));

    await expect(service.getForecast(-23.5, -46.6)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  // ─── getForecast — apiKey ausente ─────────────────────────────────────────

  it('getForecast — lança InternalServerErrorException quando OPENWEATHER_API_KEY não está configurada', async () => {
    configGet.mockReturnValue('');

    await expect(service.getForecast(-23.5, -46.6)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(httpService.get).not.toHaveBeenCalled();
  });

  it('getForecast — deve retornar dados cacheados na segunda chamada consecutiva para coordenadas semelhantes', async () => {
    httpService.get.mockReturnValue(of(makeAxiosResponse(OW_FORECAST_STUB)));

    const result1 = await service.getForecast(-23.5123, -46.6123);
    const result2 = await service.getForecast(-23.5124, -46.6124); // Diferença na 4ª casa decimal (arredonda para o mesmo valor)

    expect(result1).toEqual(result2);
    expect(httpService.get).toHaveBeenCalledTimes(1); // Apenas uma chamada HTTP
  });

  it('getForecast — deve expirar e evictar itens antigos quando ultrapassar max size', async () => {
    const testCache = new LRUCache<string, any>({ max: 3, ttl: 5000 });
    (service as any).cache = testCache;

    httpService.get.mockReturnValue(of(makeAxiosResponse(OW_FORECAST_STUB)));

    await service.getForecast(-23.1, -46.1);
    await service.getForecast(-23.2, -46.2);
    await service.getForecast(-23.3, -46.3);

    expect(testCache.size).toBe(3);

    // O quarto elemento deve evictar o primeiro (-23.100, -46.100)
    await service.getForecast(-23.4, -46.4);
    expect(testCache.size).toBe(3);
    expect(testCache.has('-23.100,-46.100')).toBe(false);
    expect(testCache.has('-23.200,-46.200')).toBe(true);
  });
});
