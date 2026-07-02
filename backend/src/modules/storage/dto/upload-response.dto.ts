import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'URL pública do arquivo enviado' })
  url!: string;
}
