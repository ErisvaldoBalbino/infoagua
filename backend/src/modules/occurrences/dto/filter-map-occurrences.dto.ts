import { IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterMapOccurrencesDto {
  @ApiPropertyOptional({ example: -8.1, description: 'Latitude mínima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLat?: number;

  @ApiPropertyOptional({ example: -8.0, description: 'Latitude máxima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLat?: number;

  @ApiPropertyOptional({ example: -34.9, description: 'Longitude mínima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLng?: number;

  @ApiPropertyOptional({ example: -34.8, description: 'Longitude máxima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLng?: number;

  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  limit?: number = 100;
}
