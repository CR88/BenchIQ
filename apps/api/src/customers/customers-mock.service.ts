import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerRequest, UpdateCustomerRequest, Customer, CustomerSearchQuery } from '@benchiq/types';
import { MockDataService } from '../shared/mock-data.service';

@Injectable()
export class CustomersMockService {
  constructor(private mockDataService: MockDataService) {}

  async create(organizationId: string, createData: CreateCustomerRequest): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.mockDataService.getNextCustomerId(),
      organizationId,
      firstName: createData.firstName,
      lastName: createData.lastName,
      companyName: createData.companyName,
      contact: createData.contact,
      address: createData.address,
      notes: createData.notes,
      tags: createData.tags || [],
      customFields: createData.customFields || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockDataService.addCustomer(newCustomer);
    return newCustomer;
  }

  async findAll(organizationId: string, searchQuery?: CustomerSearchQuery): Promise<Customer[]> {
    let customers = this.mockDataService.getCustomersByOrganization(organizationId);

    if (searchQuery?.search) {
      const searchTerm = searchQuery.search.toLowerCase();
      customers = customers.filter(customer =>
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm)) ||
        (customer.contact.email && customer.contact.email.toLowerCase().includes(searchTerm)) ||
        (customer.contact.phone && customer.contact.phone.includes(searchTerm))
      );
    }

    if (searchQuery?.tags && Array.isArray(searchQuery.tags)) {
      const searchTags = searchQuery.tags.map(tag => tag.toLowerCase());
      customers = customers.filter(customer =>
        customer.tags.some(tag =>
          searchTags.some(searchTag => tag.toLowerCase().includes(searchTag))
        )
      );
    }

    if (searchQuery?.hasEmail !== undefined) {
      customers = customers.filter(customer =>
        searchQuery.hasEmail ? customer.contact.email : !customer.contact.email
      );
    }

    if (searchQuery?.hasPhone !== undefined) {
      customers = customers.filter(customer =>
        searchQuery.hasPhone ? customer.contact.phone : !customer.contact.phone
      );
    }

    if (searchQuery?.hasAddress !== undefined) {
      customers = customers.filter(customer =>
        searchQuery.hasAddress ? customer.address : !customer.address
      );
    }

    return customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string, organizationId: string): Promise<Customer> {
    const customer = this.mockDataService.getCustomerById(id);
    if (!customer || customer.organizationId !== organizationId) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, organizationId: string, updateData: UpdateCustomerRequest): Promise<Customer> {
    const existingCustomer = await this.findById(id, organizationId);

    const updatedCustomer = this.mockDataService.updateCustomer(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updatedCustomer) {
      throw new NotFoundException('Customer not found');
    }

    return updatedCustomer;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId); // Ensure customer exists and belongs to organization

    const deleted = this.mockDataService.deleteCustomer(id);
    if (!deleted) {
      throw new NotFoundException('Customer not found');
    }
  }

  async getStats(organizationId: string): Promise<{
    total: number;
    withEmail: number;
    withPhone: number;
    withAddress: number;
  }> {
    const customers = this.mockDataService.getCustomersByOrganization(organizationId);

    const withEmail = customers.filter(c => c.contact.email).length;
    const withPhone = customers.filter(c => c.contact.phone).length;
    const withAddress = customers.filter(c => c.address).length;

    return {
      total: customers.length,
      withEmail,
      withPhone,
      withAddress,
    };
  }
}