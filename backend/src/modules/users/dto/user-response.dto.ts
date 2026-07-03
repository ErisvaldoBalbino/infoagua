import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-1' })
  id: string;

  @ApiProperty({ example: 'José Silva' })
  name: string;

  @ApiProperty({ example: 'jose@example.com' })
  email: string;

  @ApiProperty()
  createdAt: Date;
}
