import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { WeatherResponseDto } from './dto/weather-response.dto';

// ─── OpenWeather API types ────────────────────────────────────────────────────

interface OWForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  pop: number; // probability of precipitation (0–1)
}

interface OWForecastResponse {
  list: OWForecastItem[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

interface CacheEntry {
  data: WeatherResponseDto;
  expiresAt: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  // ─── getForecast ─────────────────────────────────────────────────────────────

  async getForecast(lat: number, lon: number): Promise<WeatherResponseDto> {
    const apiKey = this.config.get<string>('openWeather.apiKey', '');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENWEATHER_API_KEY não configurada.',
      );
    }

    const latKey = Number(lat).toFixed(3);
    const lonKey = Number(lon).toFixed(3);
    const cacheKey = `${latKey},${lonKey}`;

    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const url =
      `${this.baseUrl}?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric&cnt=1&lang=pt_br`;

    let data: OWForecastResponse;

    try {
      const response = await firstValueFrom(
        this.http.get<OWForecastResponse>(url),
      );
      data = response.data;
    } catch (err) {
      const axiosError = err as {
        message?: string;
        response?: { status?: number; data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message || axiosError.message || String(err);
      const status = axiosError.response?.status;
      this.logger.error(
        `Falha ao consultar OpenWeather API: ${message}${status ? ` (Status: ${status})` : ''}`,
      );
      throw new ServiceUnavailableException(
        'Serviço de previsão do tempo indisponível no momento.',
      );
    }

    if (!data.list?.length) {
      throw new ServiceUnavailableException(
        'OpenWeather não retornou dados de previsão.',
      );
    }

    const item = data.list[0];

    const result = {
      temperature: item.main.temp,
      description: item.weather[0]?.description ?? '',
      rainProbability: item.pop,
      icon: item.weather[0]?.icon ?? '',
      datetime: new Date(item.dt * 1000).toISOString(),
    };

    this.cache.set(cacheKey, {
      data: result,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return result;
  }
}
