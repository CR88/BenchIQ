import { Injectable } from '@nestjs/common';
import { CustomersMockService } from '../customers/customers-mock.service';
import { TicketsMockService } from '../tickets/tickets-mock.service';

export interface DashboardStats {
  totalCustomers: number;
  activeTickets: number;
  inventoryItems: number;
  monthlyRevenue: number;
}

@Injectable()
export class DashboardMockService {
  constructor(
    private customersService: CustomersMockService,
    private ticketsService: TicketsMockService
  ) {}

  async getStats(organizationId: string): Promise<DashboardStats> {
    // Get customer stats
    const customerStats = await this.customersService.getStats(organizationId);

    // Get ticket stats and calculate active tickets count
    const ticketStats = await this.ticketsService.getStats(organizationId);
    const activeTicketsCount = (ticketStats.byStatus['NEW'] || 0) +
                               (ticketStats.byStatus['IN_PROGRESS'] || 0) +
                               (ticketStats.byStatus['WAITING_PARTS'] || 0);

    // For now, other stats are mocked since we don't have inventory services yet
    // TODO: Replace with real services when they're implemented
    return {
      totalCustomers: customerStats.total,
      activeTickets: activeTicketsCount, // Now properly counts only open tickets
      inventoryItems: 0, // TODO: Get from inventory service
      monthlyRevenue: 0, // TODO: Get from orders/billing service
    };
  }
}