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

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

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
      this.logger.error('Falha ao consultar OpenWeather API', err);
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

    return {
      temperature: item.main.temp,
      description: item.weather[0]?.description ?? '',
      rainProbability: item.pop,
      icon: item.weather[0]?.icon ?? '',
      datetime: new Date(item.dt * 1000).toISOString(),
    };
  }
}
