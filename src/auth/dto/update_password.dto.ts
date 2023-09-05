import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The new password for the user.',
    minLength: 6,
    example: 'newPassword123',
  })
  password: string;
}
