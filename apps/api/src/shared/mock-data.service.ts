import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Ticket, Asset, Customer } from '@benchiq/types';

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'OWNER' | 'MANAGER' | 'TECHNICIAN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_SETUP';
  organizationId: string;
  createdAt: Date;
  temporaryPassword?: string;
  firstTimeLogin?: boolean;
}

export interface MockOrganization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  activeUserLimit: number;
  features: string[];
  billingEmail: string;
  country: string;
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    taxRate: number;
    businessHours: {
      monday?: { open: string; close: string } | null;
      tuesday?: { open: string; close: string } | null;
      wednesday?: { open: string; close: string } | null;
      thursday?: { open: string; close: string } | null;
      friday?: { open: string; close: string } | null;
      saturday?: { open: string; close: string } | null;
      sunday?: { open: string; close: string } | null;
    };
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact?: {
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastPaymentAt?: Date;
  nextBillingDate?: Date;
  monthlyRevenue: number;
  userCount: number;
  ticketCount?: number;
  storageUsed?: number;
}

@Injectable()
export class MockDataService implements OnModuleInit {
  private static readonly DATA_FILE = path.join(process.cwd(), 'mock-data.json');
  private static users: MockUser[] = [
    {
      id: '1',
      email: 'owner@demorepairshop.com',
      passwordHash: '$2b$10$V8UvS5J4SgZGQYZRDM9jceR7vP.H2C.Mm4mVGl8Gm1m.xGHZYnZ4W', // password123
      firstName: 'John',
      lastName: 'Doe',
      role: 'OWNER',
      status: 'ACTIVE',
      organizationId: '1',
      createdAt: new Date('2024-01-15'),
    }
  ];

  private static organizations: MockOrganization[] = [
    {
      id: '1',
      name: 'Demo Repair Shop',
      description: 'A demonstration repair shop for testing BenchIQ',
      logo: '',
      plan: 'FREE',
      status: 'ACTIVE',
      activeUserLimit: 1,
      features: ['Basic Ticketing', 'Customer Management', '1 User'],
      billingEmail: 'owner@demorepairshop.com',
      country: 'GB',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h' as const,
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
      address: {
        street: '123 Main St',
        city: 'Demo City',
        state: 'NY',
        postalCode: '12345',
        country: 'US',
      },
      contact: {
        email: 'owner@demorepairshop.com',
        phone: '+1-555-123-4567',
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      monthlyRevenue: 0,
      userCount: 1,
      ticketCount: 0,
      storageUsed: 12,
    }
  ];

  private static tickets: Ticket[] = [];

  private static assets: Asset[] = [];

  private static customers: Customer[] = [
    {
      id: '1',
      organizationId: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      companyName: 'Tech Solutions Inc',
      contact: {
        email: 'alice@techsolutions.com',
        phone: '+1-555-234-5678',
      },
      address: {
        street: '456 Oak Ave',
        city: 'Demo City',
        state: 'NY',
        postalCode: '12345',
        country: 'US',
      },
      notes: 'Regular customer, prefers email communication',
      tags: ['regular', 'corporate', 'priority'],
      customFields: {},
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      organizationId: '1',
      firstName: 'Bob',
      lastName: 'Smith',
      contact: {
        email: 'bob@example.com',
        phone: '+1-555-345-6789',
      },
      notes: 'Walk-in customer',
      tags: ['walk-in'],
      customFields: {},
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ];

  // Initialize and load data from file
  async onModuleInit() {
    await this.loadDataFromFile();
  }

  private async loadDataFromFile(): Promise<void> {
    try {
      if (fs.existsSync(MockDataService.DATA_FILE)) {
        const data = fs.readFileSync(MockDataService.DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);

        if (parsed.users && Array.isArray(parsed.users)) {
          MockDataService.users = parsed.users.map(u => ({
            ...u,
            createdAt: new Date(u.createdAt)
          }));
        }

        if (parsed.organizations && Array.isArray(parsed.organizations)) {
          MockDataService.organizations = parsed.organizations.map(o => ({
            ...o,
            createdAt: new Date(o.createdAt),
            updatedAt: new Date(o.updatedAt),
            lastPaymentAt: o.lastPaymentAt ? new Date(o.lastPaymentAt) : undefined,
            nextBillingDate: o.nextBillingDate ? new Date(o.nextBillingDate) : undefined
          }));
        }

        if (parsed.tickets && Array.isArray(parsed.tickets)) {
          MockDataService.tickets = parsed.tickets.map(t => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            slaTargetAt: t.slaTargetAt ? new Date(t.slaTargetAt) : undefined,
            startedAt: t.startedAt ? new Date(t.startedAt) : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
            pickedUpAt: t.pickedUpAt ? new Date(t.pickedUpAt) : undefined,
          }));
        }

        if (parsed.assets && Array.isArray(parsed.assets)) {
          MockDataService.assets = parsed.assets.map(a => ({
            ...a,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
          }));
        }

        if (parsed.customers && Array.isArray(parsed.customers)) {
          MockDataService.customers = parsed.customers.map(c => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }));
        }

        console.log(`📁 Loaded ${MockDataService.users.length} users, ${MockDataService.organizations.length} organizations, ${MockDataService.tickets.length} tickets, ${MockDataService.assets.length} assets, and ${MockDataService.customers.length} customers from file`);
      }
    } catch (error) {
      console.error('Error loading mock data from file:', error);
    }
  }

  private async saveDataToFile(): Promise<void> {
    try {
      const data = {
        users: MockDataService.users,
        organizations: MockDataService.organizations,
        tickets: MockDataService.tickets,
        assets: MockDataService.assets,
        customers: MockDataService.customers,
        lastSaved: new Date()
      };
      fs.writeFileSync(MockDataService.DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving mock data to file:', error);
    }
  }

  // User methods
  getUsers(): MockUser[] {
    return MockDataService.users;
  }

  getUserById(id: string): MockUser | undefined {
    return MockDataService.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): MockUser | undefined {
    return MockDataService.users.find(u => u.email === email);
  }

  addUser(user: MockUser): void {
    MockDataService.users.push(user);
    this.saveDataToFile();
  }

  updateUser(id: string, updates: Partial<MockUser>): MockUser | undefined {
    const index = MockDataService.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    MockDataService.users[index] = { ...MockDataService.users[index], ...updates };
    this.saveDataToFile();
    return MockDataService.users[index];
  }

  // Organization methods
  getOrganizations(): MockOrganization[] {
    return MockDataService.organizations;
  }

  getOrganizationById(id: string): MockOrganization | undefined {
    return MockDataService.organizations.find(o => o.id === id);
  }

  addOrganization(organization: MockOrganization): void {
    MockDataService.organizations.push(organization);
    this.updateOrganizationUserCount(organization.id);
    this.saveDataToFile();
  }

  updateOrganization(id: string, updates: Partial<MockOrganization>): MockOrganization | undefined {
    const index = MockDataService.organizations.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    MockDataService.organizations[index] = {
      ...MockDataService.organizations[index],
      ...updates,
      updatedAt: new Date()
    };
    this.saveDataToFile();
    return MockDataService.organizations[index];
  }

  deleteOrganization(id: string): boolean {
    const index = MockDataService.organizations.findIndex(o => o.id === id);
    if (index === -1) return false;

    MockDataService.organizations.splice(index, 1);
    // Also remove associated users
    MockDataService.users = MockDataService.users.filter(u => u.organizationId !== id);
    this.saveDataToFile();
    return true;
  }

  private updateOrganizationUserCount(organizationId: string): void {
    const userCount = MockDataService.users.filter(u => u.organizationId === organizationId).length;
    this.updateOrganization(organizationId, { userCount });
  }

  // Ticket methods
  getTickets(): Ticket[] {
    return MockDataService.tickets;
  }

  getTicketById(id: string): Ticket | undefined {
    return MockDataService.tickets.find(t => t.id === id);
  }

  getTicketsByOrganization(organizationId: string): Ticket[] {
    return MockDataService.tickets.filter(t => t.organizationId === organizationId);
  }

  addTicket(ticket: Ticket): void {
    MockDataService.tickets.push(ticket);
    this.saveDataToFile();
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
    const index = MockDataService.tickets.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    MockDataService.tickets[index] = { ...MockDataService.tickets[index], ...updates };
    this.saveDataToFile();
    return MockDataService.tickets[index];
  }

  deleteTicket(id: string): boolean {
    const index = MockDataService.tickets.findIndex(t => t.id === id);
    if (index === -1) return false;

    MockDataService.tickets.splice(index, 1);
    this.saveDataToFile();
    return true;
  }

  // Asset methods
  getAssets(): Asset[] {
    return MockDataService.assets;
  }

  getAssetById(id: string): Asset | undefined {
    return MockDataService.assets.find(a => a.id === id);
  }

  getAssetsByOrganization(organizationId: string): Asset[] {
    return MockDataService.assets.filter(a => a.organizationId === organizationId);
  }

  addAsset(asset: Asset): void {
    MockDataService.assets.push(asset);
    this.saveDataToFile();
  }

  updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const index = MockDataService.assets.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    MockDataService.assets[index] = { ...MockDataService.assets[index], ...updates };
    this.saveDataToFile();
    return MockDataService.assets[index];
  }

  deleteAsset(id: string): boolean {
    const index = MockDataService.assets.findIndex(a => a.id === id);
    if (index === -1) return false;

    MockDataService.assets.splice(index, 1);
    this.saveDataToFile();
    return true;
  }

  // Helper method to generate next ID
  getNextUserId(): string {
    const maxId = Math.max(...MockDataService.users.map(u => parseInt(u.id)), 0);
    return String(maxId + 1);
  }

  getNextOrganizationId(): string {
    const maxId = Math.max(...MockDataService.organizations.map(o => parseInt(o.id)), 0);
    return String(maxId + 1);
  }

  getNextTicketId(): string {
    const maxId = Math.max(...MockDataService.tickets.map(t => parseInt(t.id)), 0);
    return String(maxId + 1);
  }

  getNextAssetId(): string {
    const maxId = Math.max(...MockDataService.assets.map(a => parseInt(a.id)), 0);
    return String(maxId + 1);
  }

  generateTicketNumber(): string {
    const year = new Date().getFullYear();
    const existingTickets = MockDataService.tickets.filter(t =>
      t.ticketNumber.startsWith(`T${year}-`)
    );
    const nextNumber = existingTickets.length + 1;
    return `T${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  // Customer methods
  getCustomers(): Customer[] {
    return MockDataService.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return MockDataService.customers.find(c => c.id === id);
  }

  getCustomersByOrganization(organizationId: string): Customer[] {
    return MockDataService.customers.filter(c => c.organizationId === organizationId);
  }

  addCustomer(customer: Customer): void {
    MockDataService.customers.push(customer);
    this.saveDataToFile();
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const index = MockDataService.customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    MockDataService.customers[index] = { ...MockDataService.customers[index], ...updates };
    this.saveDataToFile();
    return MockDataService.customers[index];
  }

  deleteCustomer(id: string): boolean {
    const index = MockDataService.customers.findIndex(c => c.id === id);
    if (index === -1) return false;

    MockDataService.customers.splice(index, 1);
    this.saveDataToFile();
    return true;
  }

  getNextCustomerId(): string {
    const maxId = Math.max(...MockDataService.customers.map(c => parseInt(c.id)), 0);
    return String(maxId + 1);
  }

  // Features for plans
  getFeaturesForPlan(plan: string): string[] {
    switch (plan) {
      case 'FREE':
        return ['Basic Ticketing', 'Customer Management', '1 User'];
      case 'PRO':
        return ['All Features', 'Unlimited Users', 'Priority Support', 'Advanced Analytics'];
      case 'ENTERPRISE':
        return ['All Features', 'Unlimited Users', 'White Label', 'Custom Integrations', '24/7 Support'];
      default:
        return [];
    }
  }

  // Generate temporary password
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create organization with owner (for admin creation)
  createOrganizationWithOwner(organizationData: {
    name: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    billingEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    country?: string;
  }): { organization: MockOrganization; user: MockUser; temporaryPassword: string } {
    const now = new Date();
    const tempPassword = this.generateTemporaryPassword();

    // Create organization
    const orgId = this.getNextOrganizationId();
    const organization: MockOrganization = {
      id: orgId,
      name: organizationData.name,
      plan: organizationData.plan,
      status: 'ACTIVE',
      activeUserLimit: organizationData.plan === 'FREE' ? 1 : -1,
      features: this.getFeaturesForPlan(organizationData.plan),
      billingEmail: organizationData.billingEmail,
      country: organizationData.country || 'GB',
      createdAt: now,
      updatedAt: now,
      monthlyRevenue: organizationData.plan === 'FREE' ? 0 : 49.99,
      userCount: 1,
      ticketCount: 0,
      storageUsed: 0,
    };

    // Create owner user with temporary password
    const userId = this.getNextUserId();
    const user: MockUser = {
      id: userId,
      email: organizationData.billingEmail,
      passwordHash: '$2b$10$temp.password.hash', // Will be updated on first login
      firstName: organizationData.ownerFirstName,
      lastName: organizationData.ownerLastName,
      role: 'OWNER',
      status: 'PENDING_SETUP',
      organizationId: orgId,
      createdAt: now,
      temporaryPassword: tempPassword,
      firstTimeLogin: true,
    };

    this.addOrganization(organization);
    this.addUser(user);

    return { organization, user, temporaryPassword: tempPassword };
  }
}