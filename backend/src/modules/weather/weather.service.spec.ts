import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
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

  beforeEach(async () => {
    const httpMock = { get: jest.fn() };
    const configMock = {
      get: jest.fn().mockReturnValue('fake-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = httpMock as any;
  });

  // ─── getForecast — sucesso ────────────────────────────────────────────────

  it('getForecast — retorna WeatherResponseDto com dados mapeados da OpenWeather', async () => {
    httpService.get.mockReturnValue(
      of(makeAxiosResponse(OW_FORECAST_STUB)),
    );

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
});
