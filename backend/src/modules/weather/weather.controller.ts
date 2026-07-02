import {
  Controller,
  Get,
  ParseFloatPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // ─── GET /weather ─────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Previsão de chuva para a localização informada' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude', example: -23.5 })
  @ApiQuery({ name: 'lon', type: Number, description: 'Longitude', example: -46.6 })
  @ApiResponse({ status: 200, type: WeatherResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetros lat/lon inválidos' })
  @ApiResponse({
    status: 503,
    description: 'Serviço de previsão do tempo indisponível',
  })
  getForecast(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.getForecast(lat, lon);
  }
}
