import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FloorsModule } from './modules/floors/floors.module';
import { RoomRequestsModule } from './modules/room-requests/room-requests.module';
import { AllocationsModule } from './modules/allocations/allocations.module';
import { RoommateRequestsModule } from './modules/roommate-requests/roommate-requests.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MailModule } from './modules/mail/mail.module';
import { ActivityHubModule } from './modules/activity-hub/activity-hub.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute by default
    }]),
    ConfigurationModule,
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    AdminModule,
    UsersModule,
    HostelsModule,
    RoomsModule,
    FloorsModule,
    RoomRequestsModule,
    AllocationsModule,
    RoommateRequestsModule,
    BookingsModule,
    TicketsModule,
    MarketplaceModule,
    TransactionsModule,
    AuditModule,
    SupabaseModule,
    InvoicesModule,
    PaymentsModule,
    MessagesModule,
    MailModule,
    ActivityHubModule,
  ],
  providers: [
    // Global JWT auth guard — all routes require auth unless @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
