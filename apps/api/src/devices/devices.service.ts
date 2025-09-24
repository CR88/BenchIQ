import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, customerId?: string) {
    const where: any = { organizationId };
    if (customerId) {
      where.customerId = customerId;
    }

    return this.prisma.device.findMany({
      where,
      include: {
        customer: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        customer: true,
        tickets: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async update(id: string, organizationId: string, data: any) {
    await this.findOne(id, organizationId);

    return this.prisma.device.update({
      where: { id },
      data: {
        type: data.type,
        make: data.make,
        model: data.model,
        serialNumber: data.serialNumber,
        imei: data.imei,
        color: data.color,
        storageCapacity: data.storageCapacity,
        condition: data.condition,
        passcode: data.passcode,
        accessories: data.accessories,
        notes: data.notes,
        customFields: data.customFields,
      },
      include: {
        customer: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    
    await this.prisma.device.delete({
      where: { id },
    });

    return { success: true };
  }
}