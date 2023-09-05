import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailService } from './mail.service';
import { AuthGuard } from './guards/auth.guard';
import { UserInterceptor } from './interceptors/user.interceptor';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailService,
    AuthGuard,
    UserInterceptor,
  ],
  exports: [AuthGuard, UserInterceptor, AuthService],
})
export class AuthModule {}
