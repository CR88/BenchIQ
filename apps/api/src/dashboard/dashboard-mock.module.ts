import { Module } from '@nestjs/common';
import { DashboardMockController } from './dashboard-mock.controller';
import { DashboardMockService } from './dashboard-mock.service';
import { CustomersMockModule } from '../customers/customers-mock.module';
import { TicketsMockModule } from '../tickets/tickets-mock.module';

@Module({
  imports: [CustomersMockModule, TicketsMockModule],
  controllers: [DashboardMockController],
  providers: [DashboardMockService],
  exports: [DashboardMockService],
})
export class DashboardMockModule {}