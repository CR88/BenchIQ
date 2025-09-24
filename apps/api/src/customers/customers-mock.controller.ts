import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomersMockService } from './customers-mock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCustomerRequest, UpdateCustomerRequest, Customer, CustomerSearchQuery } from '@benchiq/types';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersMockController {
  constructor(private customersService: CustomersMockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers for organization' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, or phone' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'hasEmail', required: false, description: 'Filter by presence of email' })
  @ApiQuery({ name: 'hasPhone', required: false, description: 'Filter by presence of phone' })
  @ApiQuery({ name: 'hasAddress', required: false, description: 'Filter by presence of address' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('hasEmail') hasEmail?: boolean,
    @Query('hasPhone') hasPhone?: boolean,
    @Query('hasAddress') hasAddress?: boolean,
  ): Promise<Customer[]> {
    const searchQuery: CustomerSearchQuery = {
      search,
      tags: tags ? tags.split(',') : undefined,
      hasEmail,
      hasPhone,
      hasAddress,
    };

    return this.customersService.findAll(user.organizationId, searchQuery);
  }

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @CurrentUser() user: any,
    @Body() createData: CreateCustomerRequest,
  ): Promise<Customer> {
    return this.customersService.create(user.organizationId, createData);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@CurrentUser() user: any): Promise<{
    total: number;
    withEmail: number;
    withPhone: number;
    withAddress: number;
  }> {
    return this.customersService.getStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string): Promise<Customer> {
    return this.customersService.findById(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: UpdateCustomerRequest,
  ): Promise<Customer> {
    return this.customersService.update(id, user.organizationId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async delete(@CurrentUser() user: any, @Param('id') id: string): Promise<{ message: string }> {
    await this.customersService.delete(id, user.organizationId);
    return { message: 'Customer deleted successfully' };
  }
}