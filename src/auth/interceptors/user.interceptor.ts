import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const jwt = authHeader.split(' ')[1];

    try {
      const decoded = await this.jwtService.verifyAsync(jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Check if token is expired
      if (Date.now() >= decoded.exp * 1000) {
        throw new UnauthorizedException('Token has expired');
      }

      // Fetch user information based on the decoded token
      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.sub,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          emailToken: true,
          emailvalid: true,
          Bookmarks: true,
          roles: true,
        },
      });

      // Attach user to request object
      request.user = user;

      return next.handle();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
