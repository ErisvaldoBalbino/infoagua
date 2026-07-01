import { ApiProperty } from '@nestjs/swagger';

export class PublicProfileDto {
  @ApiProperty({ example: 'uuid-1' })
  id: string;

  @ApiProperty({ example: 'José Silva' })
  name: string;

  @ApiProperty()
  createdAt: Date;
}
