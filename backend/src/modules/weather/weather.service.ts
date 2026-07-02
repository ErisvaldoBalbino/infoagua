import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
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
  pop: number;
}

interface OWForecastResponse {
  list: OWForecastItem[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class WeatherService {
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getForecast(lat: number, lon: number): Promise<WeatherResponseDto> {
    const apiKey = this.config.get<string>('openWeather.apiKey', '');

    const url =
      `${this.baseUrl}?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric&cnt=1&lang=pt_br`;

    let data: OWForecastResponse;

    try {
      const response = await firstValueFrom(
        this.http.get<OWForecastResponse>(url),
      );
      data = response.data;
    } catch {
      throw new ServiceUnavailableException(
        'Serviço de previsão do tempo indisponível no momento.',
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
