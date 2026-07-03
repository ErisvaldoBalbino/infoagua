import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OccurrenceType } from '@prisma/client';

export class CreateOccurrenceDto {
  @ApiProperty({ enum: OccurrenceType, description: 'Tipo da ocorrência' })
  @IsEnum(OccurrenceType)
  type!: OccurrenceType;

  @ApiPropertyOptional({ description: 'Descrição detalhada', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: -8.0476, description: 'Latitude' })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -34.877, description: 'Longitude' })
  @IsLongitude()
  longitude!: number;

  @ApiProperty({
    example: 'Recife',
    description: 'Cidade da ocorrência',
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ description: 'URL da foto' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  photoUrl?: string;
}
