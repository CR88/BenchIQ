import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.organizationId);
  }

  @Get('tickets-by-status')
  getTicketsByStatus(@Request() req) {
    return this.dashboardService.getTicketsByStatus(req.user.organizationId);
  }

  @Get('revenue-by-month')
  getRevenueByMonth(@Request() req, @Query('months') months?: string) {
    const monthCount = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getRevenueByMonth(req.user.organizationId, monthCount);
  }
}