import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  valid: boolean;
}
