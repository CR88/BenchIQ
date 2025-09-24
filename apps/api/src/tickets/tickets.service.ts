import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  private async generateTicketNumber(organizationId: string): Promise<string> {
    const lastTicket = await this.prisma.ticket.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const lastNumber = lastTicket?.ticketNumber 
      ? parseInt(lastTicket.ticketNumber.replace(/\D/g, ''))
      : 0;
    
    return `T${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(organizationId: string, userId: string, data: any) {
    const ticketNumber = await this.generateTicketNumber(organizationId);

    try {
      const ticket = await this.prisma.ticket.create({
        data: {
          ticketNumber,
          organizationId,
          customerId: data.customerId,
          deviceId: data.deviceId,
          title: data.title || 'New Repair Ticket',
          description: data.description || '',
          status: TicketStatus.NEW,
          priority: data.priority || 'MEDIUM',
          assignedTo: data.assignedTo,
          problemDescription: data.problemDescription || '',
          solutionDescription: data.solutionDescription,
          estimatedCost: data.estimatedCost,
          slaTargetAt: data.slaTargetAt ? new Date(data.slaTargetAt) : null,
          tags: data.tags || [],
          attachments: data.attachments || [],
          customFields: data.customFields || {},
        },
        include: {
          customer: true,
          device: true,
          assignee: true,
        },
      });

      return ticket;
    } catch (error) {
      throw new BadRequestException('Failed to create ticket');
    }
  }

  async findAll(organizationId: string, query?: any) {
    const where: Prisma.TicketWhereInput = {
      organizationId,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    if (query?.customerId) {
      where.customerId = query.customerId;
    }

    if (query?.search) {
      where.OR = [
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        customer: true,
        device: true,
        assignee: true,
        _count: {
          select: {
            notes: true,
            timeEntries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets;
  }

  async findOne(id: string, organizationId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        customer: true,
        device: true,
        assignee: true,
        notes: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          include: {
            user: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, organizationId: string, data: any) {
    const existing = await this.findOne(id, organizationId);
    
    const updateData: any = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
      problemDescription: data.problemDescription,
      solutionDescription: data.solutionDescription,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
      slaTargetAt: data.slaTargetAt ? new Date(data.slaTargetAt) : undefined,
      tags: data.tags,
      attachments: data.attachments,
      customFields: data.customFields,
    };

    // Update status timestamps
    if (data.status && data.status !== existing.status) {
      switch (data.status) {
        case TicketStatus.IN_PROGRESS:
          updateData.startedAt = new Date();
          break;
        case TicketStatus.READY:
          updateData.completedAt = new Date();
          break;
        case TicketStatus.PICKED_UP:
          updateData.pickedUpAt = new Date();
          break;
      }
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        device: true,
        assignee: true,
      },
    });

    return updated;
  }

  async updateStatus(id: string, organizationId: string, status: TicketStatus) {
    return this.update(id, organizationId, { status });
  }

  async addNote(ticketId: string, organizationId: string, userId: string, data: any) {
    await this.findOne(ticketId, organizationId);

    const note = await this.prisma.ticketNote.create({
      data: {
        ticketId,
        userId,
        content: data.content,
        isInternal: data.isInternal ?? true,
      },
      include: {
        user: true,
      },
    });

    return note;
  }

  async addTimeEntry(ticketId: string, organizationId: string, userId: string, data: any) {
    await this.findOne(ticketId, organizationId);

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        ticketId,
        userId,
        description: data.description,
        hours: data.hours,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        user: true,
      },
    });

    return timeEntry;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    
    await this.prisma.ticket.delete({
      where: { id },
    });

    return { success: true };
  }
}