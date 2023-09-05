import { ApiResponseProperty } from '@nestjs/swagger';

export class ResetPasswordResponse {
  @ApiResponseProperty()
  message: string;
}
