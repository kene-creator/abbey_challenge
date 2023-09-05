import { ApiResponseProperty } from '@nestjs/swagger';

export class SignupResponse {
  @ApiResponseProperty()
  access_token: string;

  @ApiResponseProperty()
  verification_token: string;
}
