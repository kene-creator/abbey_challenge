import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class SignInResponse {
  @ApiResponseProperty()
  access_token: string;

  @ApiResponseProperty()
  user: User;
}
