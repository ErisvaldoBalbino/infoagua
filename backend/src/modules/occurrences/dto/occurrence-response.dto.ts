import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OccurrenceType } from '@prisma/client';

export class OccurrenceUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class OccurrenceResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: OccurrenceType }) type!: OccurrenceType;
  @ApiPropertyOptional() description?: string | null;
  @ApiProperty() latitude!: number;
  @ApiProperty() longitude!: number;
  @ApiProperty() city!: string;
  @ApiPropertyOptional() photoUrl?: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() likesCount!: number;
  @ApiProperty() commentsCount!: number;
  @ApiProperty({ type: OccurrenceUserDto }) user!: OccurrenceUserDto;
}

export class OccurrenceMapPinDto {
  @ApiProperty() id!: string;
  @ApiProperty() latitude!: number;
  @ApiProperty() longitude!: number;
  @ApiProperty({ enum: OccurrenceType }) type!: OccurrenceType;
}
