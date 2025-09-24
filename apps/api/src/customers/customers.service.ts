import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: any) {
    try {
      const customer = await this.prisma.customer.create({
        data: {
          organizationId,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          contact: data.contact || {},
          address: data.address,
          notes: data.notes,
          tags: data.tags || [],
          customFields: data.customFields || {},
        },
        include: {
          devices: true,
        },
      });
      return customer;
    } catch (error) {
      throw new BadRequestException('Failed to create customer');
    }
  }

  async findAll(organizationId: string, query?: any) {
    const where: Prisma.CustomerWhereInput = {
      organizationId,
    };

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.tags) {
      where.tags = { has: query.tags };
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        devices: true,
        _count: {
          select: {
            tickets: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers;
  }

  async findOne(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        devices: true,
        tickets: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, organizationId: string, data: any) {
    const existing = await this.findOne(id, organizationId);
    
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        contact: data.contact,
        address: data.address,
        notes: data.notes,
        tags: data.tags,
        customFields: data.customFields,
      },
      include: {
        devices: true,
      },
    });

    return updated;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    
    await this.prisma.customer.delete({
      where: { id },
    });

    return { success: true };
  }

  async addDevice(customerId: string, organizationId: string, data: any) {
    await this.findOne(customerId, organizationId);

    const device = await this.prisma.device.create({
      data: {
        customerId,
        organizationId,
        type: data.type,
        make: data.make,
        model: data.model,
        serialNumber: data.serialNumber,
        imei: data.imei,
        color: data.color,
        storageCapacity: data.storageCapacity,
        condition: data.condition,
        passcode: data.passcode,
        accessories: data.accessories || [],
        notes: data.notes,
        customFields: data.customFields || {},
      },
    });

    return device;
  }
}