import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'José Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jose@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
