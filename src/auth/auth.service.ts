import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, CreateUserDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from './mail.service';
import { ResetPasswordDto } from './dto';
import { Role } from './enums/roles.enums';
import { User } from '@prisma/client';
import { TooManyFailedAttemptsException } from '@app/shared/exceptions/tooManyFailedAttempts.exception';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  public async signup(
    dto: CreateUserDto,
    roles: Role[],
  ): Promise<{ access_token: string; verification_token: string }> {
    let transaction: unknown;

    const verificationToken: string = this.generateVerificationToken();

    try {
      const hash: string = await argon.hash(dto.password);

      transaction = await this.prisma.$transaction([
        this.prisma.user.create({
          data: {
            id: uuidv4(),
            email: dto.email,
            hash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            emailToken: verificationToken,
            roles,
          },
        }),
      ]);

      const user = transaction[0];
      const token = await this.signToken(user.id, user.email);

      delete user.hash;

      return {
        access_token: token.access_token,
        verification_token: verificationToken,
      };
    } catch (err) {
      if (!transaction) {
        await this.prisma.$queryRaw`ROLLBACK`;
      }
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          //* handle the error
          throw new ForbiddenException('Email already exists');
        }
      }
      throw err;
    } finally {
      try {
        if (transaction) {
          await this.mailService.sendVerificationEmail(
            dto.email,
            verificationToken,
          );
        }
        console.log('sent mail');
      } catch (err) {
        console.error('Error sending verification email:', err);
      }
    }
  }

  async signin(dto: AuthDto): Promise<{ access_token: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Email or password is wrong');
    }

    const isPasswordCorrect = await argon.verify(user.hash, dto.password);
    const refreshToken: string = await this.generateRefreshToken(user.id);

    if (!isPasswordCorrect) {
      user.failedSignInAttempts = (user.failedSignInAttempts || 0) + 1;
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          failedSignInAttempts: user.failedSignInAttempts,
        },
      });
      if (user.failedSignInAttempts >= 3) {
        throw new TooManyFailedAttemptsException();
      }
      throw new ForbiddenException('Email or password is wrong');
    }

    // If sign-in succeeds, reset the failed sign-in attempts counter to 0
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedSignInAttempts: 0,
      },
    });

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    const token = await this.signToken(user.id, user.email);

    delete user.hash;

    return { access_token: token.access_token, user };
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token: token,
    };
  }

  generateVerificationToken(): string {
    const tokenLength = 32;

    const randomBytesBuffer = randomBytes(tokenLength);

    const token = randomBytesBuffer.toString('hex');

    return token;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshTokenPayload = { sub: userId };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
      secret: process.env.JWT_SECRET,
    });

    return refreshToken;
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          emailToken: token,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailvalid: true,
        },
      });

      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        //? Handle specific Prisma errors
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  async verifyJwt(jwt: string): Promise<{ user: User; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });
      const { user, exp } = decoded;
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException('Invalid token for verify');
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!refreshToken) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET, // Use the correct refresh token secret
      });
      return decoded ? true : false;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.generateVerificationToken();
    const resetTokenExpiration = new Date();
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiresAt: resetTokenExpiration,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async updatePassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await argon.hash(newPassword);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hash: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
