import { ApiResponseProperty } from '@nestjs/swagger';

export class UpdatePasswordResponse {
  @ApiResponseProperty()
  message: string;
}
