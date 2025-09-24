import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrganizationRequest, UpdateOrganizationRequest, Organization } from '@benchiq/types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createData: CreateOrganizationRequest): Promise<Organization> {
    const organization = await this.prisma.organization.create({
      data: {
        name: createData.name,
        plan: 'FREE',
        activeUserLimit: 1,
        settings: createData.settings || {
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12h',
          taxRate: 0,
          businessHours: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: null,
            sunday: null,
          },
        },
        address: createData.address,
        contact: createData.contact,
      },
    });

    return organization as Organization;
  }

  async findById(id: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization as Organization;
  }

  async update(id: string, updateData: UpdateOrganizationRequest): Promise<Organization> {
    const existingOrg = await this.findById(id);

    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        logo: updateData.logo,
        settings: updateData.settings,
        address: updateData.address,
        contact: updateData.contact,
      },
    });

    return organization as Organization;
  }

  async checkUserLimit(organizationId: string): Promise<boolean> {
    const organization = await this.findById(organizationId);
    const activeUserCount = await this.prisma.user.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    });

    return activeUserCount < organization.activeUserLimit;
  }

  async upgradeToPro(id: string): Promise<Organization> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        plan: 'PRO',
        activeUserLimit: 999, // Effectively unlimited for Pro plan
      },
    });

    return organization as Organization;
  }

  async downgradeToFree(id: string): Promise<Organization> {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        plan: 'FREE',
        activeUserLimit: 1,
      },
    });

    return organization as Organization;
  }

  async uploadLogo(organizationId: string, file: Express.Multer.File): Promise<{ logoUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF files are allowed.');
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 2MB.');
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `logo-${organizationId}-${timestamp}-${randomString}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // For demo purposes, we'll use a data URL instead of actual file storage
      const logoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Update organization with logo URL
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { logo: logoUrl },
      });

      return { logoUrl };
    } catch (error) {
      throw new BadRequestException('Failed to upload logo');
    }
  }
}