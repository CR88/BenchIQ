import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TicketsMockService } from './tickets-mock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  Ticket,
  TicketSearchQuery,
  AddTicketNoteRequest,
  AddTimeEntryRequest
} from '@benchiq/types';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsMockController {
  constructor(private ticketsService: TicketsMockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tickets for organization' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for title, description, or ticket number' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by date from (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by date to (ISO string)' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('customerId') customerId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('tags') tags?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Ticket[]> {
    const searchQuery: TicketSearchQuery = {
      search,
      status: status as any,
      priority: priority as any,
      customerId,
      assignedTo,
      tags: tags ? tags.split(',') : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return this.ticketsService.findAll(user.organizationId, searchQuery);
  }

  @Post()
  @ApiOperation({ summary: 'Create new ticket' })
  @ApiBody({
    description: 'Ticket data',
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', format: 'uuid', description: 'Customer ID' },
        title: { type: 'string', description: 'Ticket title' },
        description: { type: 'string', description: 'Ticket description' },
        problemDescription: { type: 'string', description: 'Problem description' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        assets: {
          type: 'array',
          description: 'Assets brought in for repair',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              serialNumber: { type: 'string' },
              condition: { type: 'string' }
            }
          }
        },
        computerPassword: { type: 'string', description: 'Computer password (printable)' },
        sensitiveData: { type: 'string', description: 'Sensitive login information (NOT printable)' }
      },
      required: ['customerId', 'title', 'description', 'problemDescription']
    }
  })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @CurrentUser() user: any,
    @Body() createData: CreateTicketRequest,
  ): Promise<Ticket> {
    return this.ticketsService.create(user.organizationId, createData);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@CurrentUser() user: any): Promise<{
    totalTickets: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    avgResolutionTime: number;
  }> {
    return this.ticketsService.getStats(user.organizationId);
  }

  @Get('search/:barcode')
  @ApiOperation({ summary: 'Search ticket by barcode' })
  @ApiParam({ name: 'barcode', description: 'Barcode data to search for' })
  @ApiResponse({ status: 200, description: 'Ticket found' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async searchByBarcode(
    @CurrentUser() user: any,
    @Param('barcode') barcodeData: string,
  ): Promise<Ticket | null> {
    return this.ticketsService.searchByBarcode(barcodeData, user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string): Promise<Ticket> {
    return this.ticketsService.findById(id, user.organizationId);
  }

  @Get('number/:ticketNumber')
  @ApiOperation({ summary: 'Get ticket by ticket number' })
  @ApiParam({ name: 'ticketNumber', description: 'Ticket number (e.g., T2025-0001)' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findByTicketNumber(@CurrentUser() user: any, @Param('ticketNumber') ticketNumber: string): Promise<Ticket> {
    return this.ticketsService.findByTicketNumber(ticketNumber, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: UpdateTicketRequest,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, user.organizationId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async delete(@CurrentUser() user: any, @Param('id') id: string): Promise<{ message: string }> {
    await this.ticketsService.delete(id, user.organizationId);
    return { message: 'Ticket deleted successfully' };
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Note content' },
        isInternal: { type: 'boolean', description: 'Whether the note is internal only' }
      },
      required: ['content']
    }
  })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() noteData: AddTicketNoteRequest,
  ): Promise<Ticket> {
    return this.ticketsService.addNote(id, user.organizationId, user.userId, noteData);
  }

  @Post(':id/time')
  @ApiOperation({ summary: 'Add time entry to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Work description' },
        hours: { type: 'number', description: 'Hours worked' },
        date: { type: 'string', format: 'date-time', description: 'Date of work (optional)' }
      },
      required: ['description', 'hours']
    }
  })
  @ApiResponse({ status: 200, description: 'Time entry added successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addTimeEntry(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() timeData: AddTimeEntryRequest,
  ): Promise<Ticket> {
    return this.ticketsService.addTimeEntry(id, user.organizationId, user.userId, timeData);
  }
}