import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  Ticket,
  TicketSearchQuery,
  AddTicketNoteRequest,
  AddTimeEntryRequest
} from '@benchiq/types';
import { MockDataService } from '../shared/mock-data.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsMockService {
  constructor(private mockDataService: MockDataService) {}

  async create(organizationId: string, createData: CreateTicketRequest): Promise<Ticket> {
    const now = new Date();

    // Generate barcode data for the ticket
    const ticketNumber = this.mockDataService.generateTicketNumber();
    const barcodeData = `TICKET:${ticketNumber}`;

    const newTicket: Ticket = {
      id: this.mockDataService.getNextTicketId(),
      ticketNumber,
      organizationId,
      status: 'NEW',
      priority: createData.priority || 'MEDIUM',
      barcodeData,
      assets: createData.assets || [],
      computerPassword: createData.computerPassword,
      sensitiveData: createData.sensitiveData,
      attachments: [],
      timeEntries: [],
      notes: [],
      tags: createData.tags || [],
      customFields: createData.customFields || {},
      ...createData,
      createdAt: now,
      updatedAt: now,
    };

    this.mockDataService.addTicket(newTicket);
    return newTicket;
  }

  async findAll(organizationId: string, searchQuery?: TicketSearchQuery): Promise<Ticket[]> {
    let tickets = this.mockDataService.getTicketsByOrganization(organizationId);

    if (searchQuery?.search) {
      const searchTerm = searchQuery.search.toLowerCase();
      tickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm) ||
        ticket.problemDescription.toLowerCase().includes(searchTerm)
      );
    }

    if (searchQuery?.status) {
      tickets = tickets.filter(ticket => ticket.status === searchQuery.status);
    }

    if (searchQuery?.priority) {
      tickets = tickets.filter(ticket => ticket.priority === searchQuery.priority);
    }

    if (searchQuery?.customerId) {
      tickets = tickets.filter(ticket => ticket.customerId === searchQuery.customerId);
    }

    if (searchQuery?.assignedTo) {
      tickets = tickets.filter(ticket => ticket.assignedTo === searchQuery.assignedTo);
    }

    if (searchQuery?.tags && searchQuery.tags.length > 0) {
      tickets = tickets.filter(ticket =>
        searchQuery.tags.some(tag => ticket.tags.includes(tag))
      );
    }

    if (searchQuery?.dateFrom) {
      tickets = tickets.filter(ticket => ticket.createdAt >= searchQuery.dateFrom);
    }

    if (searchQuery?.dateTo) {
      tickets = tickets.filter(ticket => ticket.createdAt <= searchQuery.dateTo);
    }

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string, organizationId: string): Promise<Ticket> {
    const ticket = this.mockDataService.getTicketById(id);
    if (!ticket || ticket.organizationId !== organizationId) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async findByTicketNumber(ticketNumber: string, organizationId: string): Promise<Ticket> {
    const tickets = this.mockDataService.getTicketsByOrganization(organizationId);
    const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async update(id: string, organizationId: string, updateData: UpdateTicketRequest): Promise<Ticket> {
    const existingTicket = await this.findById(id, organizationId);

    const updatedTicket = this.mockDataService.updateTicket(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId); // Ensure ticket exists and belongs to organization

    const deleted = this.mockDataService.deleteTicket(id);
    if (!deleted) {
      throw new NotFoundException('Ticket not found');
    }
  }

  async addNote(id: string, organizationId: string, userId: string, noteData: AddTicketNoteRequest): Promise<Ticket> {
    const ticket = await this.findById(id, organizationId);

    const newNote = {
      id: uuidv4(),
      userId,
      content: noteData.content,
      isInternal: noteData.isInternal,
      createdAt: new Date(),
    };

    const updatedTicket = this.mockDataService.updateTicket(id, {
      notes: [...ticket.notes, newNote],
      updatedAt: new Date(),
    });

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async addTimeEntry(id: string, organizationId: string, userId: string, timeData: AddTimeEntryRequest): Promise<Ticket> {
    const ticket = await this.findById(id, organizationId);

    const newTimeEntry = {
      id: uuidv4(),
      userId,
      description: timeData.description,
      hours: timeData.hours,
      date: timeData.date || new Date(),
    };

    const updatedTicket = this.mockDataService.updateTicket(id, {
      timeEntries: [...ticket.timeEntries, newTimeEntry],
      updatedAt: new Date(),
    });

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async getStats(organizationId: string): Promise<{
    totalTickets: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    avgResolutionTime: number;
  }> {
    const tickets = this.mockDataService.getTicketsByOrganization(organizationId);

    const byStatus = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time for completed tickets
    const completedTickets = tickets.filter(t => t.completedAt);
    const avgResolutionTime = completedTickets.length > 0
      ? completedTickets.reduce((sum, ticket) => {
          const resolutionTime = ticket.completedAt!.getTime() - ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0) / completedTickets.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      totalTickets: tickets.length,
      byStatus,
      byPriority,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
    };
  }

  // Barcode search method
  async searchByBarcode(barcodeData: string, organizationId: string): Promise<Ticket | null> {
    const tickets = this.mockDataService.getTicketsByOrganization(organizationId);
    return tickets.find(t => t.barcodeData === barcodeData) || null;
  }
}