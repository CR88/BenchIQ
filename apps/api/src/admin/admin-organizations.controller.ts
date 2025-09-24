import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminOrganizationsService, Organization } from './admin-organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/organizations')
export class AdminOrganizationsController {
  constructor(private adminOrganizationsService: AdminOrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'plan', required: false, description: 'Filter by plan' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('search') search?: string,
  ): Promise<Organization[]> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.findAll({ status, plan, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@CurrentUser() user: any): Promise<{
    totalOrganizations: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    totalUsers: number;
    monthlyRevenue: number;
    planBreakdown: Record<string, number>;
  }> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string): Promise<Organization> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @CurrentUser() user: any,
    @Body() createData: {
      name: string;
      plan: 'FREE' | 'PRO' | 'ENTERPRISE';
      billingEmail: string;
      ownerFirstName: string;
      ownerLastName: string;
      country?: string;
      activeUserLimit?: number;
    },
  ): Promise<{ organization: Organization; temporaryPassword: string }> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.create(createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: Partial<Organization>,
  ): Promise<Organization> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.update(id, updateData);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization suspended successfully' })
  async suspend(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() suspendData?: { reason?: string },
  ): Promise<Organization> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.suspend(id, suspendData?.reason);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization reactivated successfully' })
  async reactivate(@CurrentUser() user: any, @Param('id') id: string): Promise<Organization> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    return this.adminOrganizationsService.reactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async delete(@CurrentUser() user: any, @Param('id') id: string): Promise<{ message: string }> {
    if (user.type !== 'admin') {
      throw new Error('Access denied');
    }

    await this.adminOrganizationsService.delete(id);
    return { message: 'Organization deleted successfully' };
  }
}