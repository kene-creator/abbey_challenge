import { ApiResponseProperty } from '@nestjs/swagger';

export class LogoutResponse {
  @ApiResponseProperty()
  message: string;
}
