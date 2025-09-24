import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDataService, MockOrganization } from '../shared/mock-data.service';

export interface Organization extends MockOrganization {
  lastPaymentAt?: Date;
  nextBillingDate?: Date;
}

@Injectable()
export class AdminOrganizationsService {
  constructor(private mockDataService: MockDataService) {}

  async findAll(filters?: {
    status?: string;
    plan?: string;
    search?: string;
  }): Promise<Organization[]> {
    let organizations = [...this.mockDataService.getOrganizations()];

    if (filters?.status) {
      organizations = organizations.filter(org => org.status === filters.status);
    }

    if (filters?.plan) {
      organizations = organizations.filter(org => org.plan === filters.plan);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      organizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm) ||
        org.billingEmail.toLowerCase().includes(searchTerm)
      );
    }

    return organizations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Organization> {
    const organization = this.mockDataService.getOrganizationById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async create(createData: {
    name: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    billingEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    country?: string;
    activeUserLimit?: number;
  }): Promise<{ organization: Organization; temporaryPassword: string }> {
    const result = this.mockDataService.createOrganizationWithOwner({
      name: createData.name,
      plan: createData.plan,
      billingEmail: createData.billingEmail,
      ownerFirstName: createData.ownerFirstName,
      ownerLastName: createData.ownerLastName,
      country: createData.country || 'GB',
    });

    return {
      organization: result.organization,
      temporaryPassword: result.temporaryPassword,
    };
  }

  async update(id: string, updateData: Partial<Organization>): Promise<Organization> {
    const result = this.mockDataService.updateOrganization(id, updateData);
    if (!result) {
      throw new NotFoundException('Organization not found');
    }
    return result;
  }

  async suspend(id: string, reason?: string): Promise<Organization> {
    return this.update(id, {
      status: 'SUSPENDED',
      monthlyRevenue: 0 // Stop revenue when suspended
    });
  }

  async reactivate(id: string): Promise<Organization> {
    const org = await this.findById(id);
    return this.update(id, {
      status: 'ACTIVE',
      monthlyRevenue: org.plan === 'FREE' ? 0 : 49.99
    });
  }

  async delete(id: string): Promise<void> {
    const success = this.mockDataService.deleteOrganization(id);
    if (!success) {
      throw new NotFoundException('Organization not found');
    }
  }

  async getStats(): Promise<{
    totalOrganizations: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    totalUsers: number;
    monthlyRevenue: number;
    planBreakdown: Record<string, number>;
  }> {
    const organizations = this.mockDataService.getOrganizations();
    const total = organizations.length;
    const active = organizations.filter(org => org.status === 'ACTIVE').length;
    const suspended = organizations.filter(org => org.status === 'SUSPENDED').length;
    const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);
    const monthlyRevenue = organizations.reduce((sum, org) => sum + org.monthlyRevenue, 0);

    const planBreakdown: Record<string, number> = {};
    organizations.forEach(org => {
      planBreakdown[org.plan] = (planBreakdown[org.plan] || 0) + 1;
    });

    return {
      totalOrganizations: total,
      activeOrganizations: active,
      suspendedOrganizations: suspended,
      totalUsers,
      monthlyRevenue,
      planBreakdown,
    };
  }

}