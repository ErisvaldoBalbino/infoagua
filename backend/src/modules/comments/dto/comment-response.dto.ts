import { ApiProperty } from '@nestjs/swagger';

export class CommentUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: () => CommentUserDto })
  user!: CommentUserDto;
}
