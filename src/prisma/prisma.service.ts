import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Try to connect with retries — don't crash the server if DB is temporarily unreachable
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully.');
        return;
      } catch (error: any) {
        this.logger.warn(
          `Database connection attempt ${attempt}/5 failed: ${error.message}`,
        );
        if (attempt < 5) {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
        }
      }
    }
    this.logger.error(
      'Could not connect to database after 5 attempts. Server will start but DB queries will fail until connection is restored.',
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma Client extension that injects the current user's context
   * into the PostgreSQL session variables for Row Level Security (RLS).
   */
  withUserContext(userId: string, role: string, hostelId: string) {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Use an interactive transaction to ensure SET LOCAL stays in the same connection
            return (this as any).$transaction(async (tx: any) => {
              await tx.$executeRawUnsafe(`
                SET LOCAL app.current_user_id = '${userId}';
                SET LOCAL app.current_user_role = '${role}';
                SET LOCAL app.current_hostel_id = '${hostelId}';
              `);
              return query(args);
            });
          },
        },
      },
    });
  }
}
