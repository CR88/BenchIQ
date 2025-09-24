import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private calculateTotalRevenue(invoices: any[]) {
    let total = 0;
    invoices.forEach(invoice => {
      if (invoice.paidAmount && typeof invoice.paidAmount === 'object' && 'amount' in invoice.paidAmount) {
        total += (invoice.paidAmount as any).amount;
      }
    });
    return { amount: total, currency: 'USD' };
  }

  async getStats(organizationId: string) {
    const [
      totalCustomers,
      totalTickets,
      openTickets,
      inProgressTickets,
      completedToday,
      invoices,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId } }),
      this.prisma.ticket.count({ where: { organizationId } }),
      this.prisma.ticket.count({
        where: {
          organizationId,
          status: { in: [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_PARTS] },
        },
      }),
      this.prisma.ticket.count({
        where: { organizationId, status: TicketStatus.IN_PROGRESS },
      }),
      this.prisma.ticket.count({
        where: {
          organizationId,
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.invoice.findMany({
        where: { organizationId },
        select: { paidAmount: true },
      }),
    ]);

    const recentTickets = await this.prisma.ticket.findMany({
      where: { organizationId },
      include: {
        customer: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const upcomingDueTickets = await this.prisma.ticket.findMany({
      where: {
        organizationId,
        status: { in: [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_PARTS] },
        slaTargetAt: { not: null },
      },
      include: {
        customer: true,
        assignee: true,
      },
      orderBy: { slaTargetAt: 'asc' },
      take: 5,
    });

    return {
      stats: {
        totalCustomers,
        totalTickets,
        openTickets,
        inProgressTickets,
        completedToday,
        totalRevenue: this.calculateTotalRevenue(invoices),
      },
      recentTickets,
      upcomingDueTickets,
    };
  }

  async getTicketsByStatus(organizationId: string) {
    const tickets = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { status: true },
    });

    return tickets.map(t => ({
      status: t.status,
      count: t._count.status,
    }));
  }

  async getRevenueByMonth(organizationId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        paidAmount: true,
      },
    });

    // Group by month
    const revenueByMonth: Record<string, any> = {};
    invoices.forEach(invoice => {
      const month = invoice.createdAt.toISOString().slice(0, 7);
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = { amount: 0, currency: 'USD' };
      }
      if (invoice.paidAmount && typeof invoice.paidAmount === 'object' && 'amount' in invoice.paidAmount) {
        revenueByMonth[month].amount += (invoice.paidAmount as any).amount;
      }
    });

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }
}