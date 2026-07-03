import { IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WeatherQueryDto {
  @ApiProperty({ description: 'Latitude (-90 a 90)', example: -23.5 })
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @ApiProperty({ description: 'Longitude (-180 a 180)', example: -46.6 })
  @Type(() => Number)
  @IsLongitude()
  lon: number;
}
