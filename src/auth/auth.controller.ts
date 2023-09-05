import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthDto,
  CreateUserDto,
  UpdatePasswordDto,
  ResetPasswordDto,
} from './dto';
import { UserInterceptor } from './interceptors/user.interceptor';
import { UserRequest } from './interfaces/user-request.interface';
import { Role } from './enums/roles.enums';
import { User } from '@prisma/client';
import { ApiResponse } from '@nestjs/swagger';
import {
  LogoutResponse,
  ResetPasswordResponse,
  UpdatePasswordResponse,
  VerifyEmailResponse,
  SignInResponse,
  SignupAdminResponse,
  SignupResponse,
} from './api_response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiResponse({
    status: 201,
    description: 'User sign up successfully',
    type: SignupResponse,
  })
  signup(
    @Body() dto: CreateUserDto,
  ): Promise<{ access_token: string; verification_token: string }> {
    return this.authService.signup(dto, [Role.USER]);
  }

  @Post('signup/admin')
  @ApiResponse({
    status: 201,
    description: 'User sign up successfully',
    type: SignupAdminResponse,
  })
  async signupAdmin(
    @Body() dto: CreateUserDto,
  ): Promise<{ access_token: string; verification_token: string }> {
    try {
      return await this.authService.signup(dto, [Role.ADMIN]);
    } catch (error) {
      throw error;
    }
  }

  @Post('signin')
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: SignInResponse,
  })
  signin(@Body() dto: AuthDto): Promise<{ access_token: string; user: User }> {
    return this.authService.signin(dto);
  }

  @Get('email/verify/:token')
  @ApiResponse({
    status: 200,
    description: 'Email verification successful',
    type: VerifyEmailResponse,
  })
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<{ message: string; valid: boolean }> {
    try {
      const verificationResult = await this.authService.verifyEmail(token);

      if (verificationResult) {
        //* Email verification successful
        return {
          message: 'Email verification successful',
          valid: verificationResult,
        };
      } else {
        //! Email verification failed
        return {
          message: 'Email verification failed',
          valid: verificationResult,
        };
      }
    } catch (error) {
      return { message: error.message, valid: false };
    }
  }

  @Post('logout')
  @UseInterceptors(UserInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponse,
  })
  async logout(@Req() req: UserRequest): Promise<{ message: string }> {
    delete req.user;
    return { message: 'Logout successful' };
  }

  @Post('reset-password')
  @ApiResponse({
    status: 200,
    description: 'Password reset request sent',
    type: ResetPasswordResponse,
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset request sent' };
  }

  @Post('update-password/:token')
  @ApiResponse({
    status: 200,
    description: 'Password update successful',
    type: UpdatePasswordResponse,
  })
  async updatePassword(
    @Param('token') token: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.updatePassword(token, dto.password);
    return { message: 'Password update successful' };
  }

  @Get('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const refreshTokenCookie = req.cookies['refreshToken'];

      if (!refreshTokenCookie) {
        res.status(400).json({ message: 'Refresh token not found in cookies' });
        return;
      }
      if (await !this.authService.validateRefreshToken(refreshTokenCookie)) {
        res.status(400).json({ message: 'Invalid refresh token' });
        return;
      }
      const user = await this.authService.getUserByRefreshToken(
        refreshTokenCookie,
      );

      if (!user) {
        res
          .status(400)
          .json({ message: 'User not found for the given refresh token' });
        return;
      }

      const refreshToken = await this.authService.generateRefreshToken(user.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        path: '/',
      });

      // Respond with the new access token
      res.status(200).json({ access_token: refreshToken });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
