import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // ─── GET /weather ─────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Previsão de chuva para a localização informada' })
  @ApiResponse({ status: 200, type: WeatherResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros lat/lon inválidos ou fora de alcance',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço de previsão do tempo indisponível',
  })
  getForecast(@Query() query: WeatherQueryDto): Promise<WeatherResponseDto> {
    return this.weatherService.getForecast(query.lat, query.lon);
  }
}
