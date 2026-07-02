import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OccurrenceType } from '@prisma/client';

export class FilterOccurrencesDto {
  @ApiPropertyOptional({
    enum: OccurrenceType,
    description: 'Filtrar por tipo',
  })
  @IsOptional()
  @IsEnum(OccurrenceType)
  type?: OccurrenceType;

  @ApiPropertyOptional({ example: 'Recife', description: 'Filtrar por cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'ID da última ocorrência retornada (cursor)',
  })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
