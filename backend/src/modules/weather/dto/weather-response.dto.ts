import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
  @ApiProperty({ description: 'Temperatura em °C', example: 24.5 })
  temperature: number;

  @ApiProperty({
    description: 'Descrição do tempo (pt_br)',
    example: 'chuva leve',
  })
  description: string;

  @ApiProperty({
    description: 'Probabilidade de chuva (0–1)',
    example: 0.72,
  })
  rainProbability: number;

  @ApiProperty({
    description: 'Código do ícone OpenWeather',
    example: '10d',
  })
  icon: string;

  @ApiProperty({
    description: 'Data/hora do período (ISO 8601)',
    example: '2026-07-02T15:00:00.000Z',
  })
  datetime: string;
}
