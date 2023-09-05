import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyFailedAttemptsException extends HttpException {
  constructor() {
    super(
      'Too many failed sign-in attempts. Your account has been temporarily locked.',
      HttpStatus.FORBIDDEN,
    );
    this.name = 'TooManyFailedAttemptsException';
  }
}
