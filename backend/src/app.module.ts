import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigurationModule } from './config/configuration.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HostelsModule } from './modules/hostels/hostels.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AuditModule } from './modules/audit/audit.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigurationModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    HostelsModule,
    RoomsModule,
    BookingsModule,
    TicketsModule,
    MarketplaceModule,
    TransactionsModule,
    AuditModule,
    SupabaseModule,
  ],
  providers: [
    // Global JWT auth guard — all routes require auth unless @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard — checks @Roles() metadata
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global tenant interceptor — sets PostgreSQL session variable
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    // Global logging interceptor — logs all requests with redaction
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
