import { ApiResponseProperty } from '@nestjs/swagger';

export class SignupAdminResponse {
  @ApiResponseProperty()
  access_token: string;

  @ApiResponseProperty()
  verification_token: string;
}
