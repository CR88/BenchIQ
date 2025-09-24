import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthMockModule } from './auth/auth-mock.module';
import { CustomersMockModule } from './customers/customers-mock.module';
import { TicketsMockModule } from './tickets/tickets-mock.module';
import { AdminModule } from './admin/admin.module';
import { DashboardMockModule } from './dashboard/dashboard-mock.module';
import { MockDataService } from './shared/mock-data.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthMockModule,
    CustomersMockModule,
    TicketsMockModule,
    DashboardMockModule,
    AdminModule,
  ],
  providers: [MockDataService],
  exports: [MockDataService],
})
export class AppMockModule {}