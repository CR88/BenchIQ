import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketStatus } from '@prisma/client';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Request() req, @Body() createTicketDto: any) {
    return this.ticketsService.create(
      req.user.organizationId,
      req.user.id,
      createTicketDto
    );
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.ticketsService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ticketsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateTicketDto: any) {
    return this.ticketsService.update(id, req.user.organizationId, updateTicketDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body('status') status: TicketStatus
  ) {
    return this.ticketsService.updateStatus(id, req.user.organizationId, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketsService.remove(id, req.user.organizationId);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Request() req, @Body() createNoteDto: any) {
    return this.ticketsService.addNote(
      id,
      req.user.organizationId,
      req.user.id,
      createNoteDto
    );
  }

  @Post(':id/time-entries')
  addTimeEntry(@Param('id') id: string, @Request() req, @Body() createTimeEntryDto: any) {
    return this.ticketsService.addTimeEntry(
      id,
      req.user.organizationId,
      req.user.id,
      createTimeEntryDto
    );
  }
}