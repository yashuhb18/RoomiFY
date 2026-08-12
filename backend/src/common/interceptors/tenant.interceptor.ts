import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.hostelId) {
      try {
        await this.prisma.$executeRawUnsafe(
          `SELECT set_config('app.current_hostel', $1, true)`,
          user.hostelId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to set tenant context for hostelId: ${user.hostelId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return next.handle();
  }
}
