import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Demo Repair Shop',
      plan: 'FREE',
      activeUserLimit: 1,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        taxRate: 0.08,
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '15:00' },
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
        email: 'contact@demorepairshop.com',
        phone: '+1-555-123-4567',
        website: 'https://demorepairshop.com',
      },
    },
  });

  // Create demo owner user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'owner@demorepairshop.com' },
    update: {},
    create: {
      email: 'owner@demorepairshop.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'OWNER',
      status: 'ACTIVE',
      organizationId: organization.id,
      contact: {
        phone: '+1-555-123-4567',
      },
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
    },
  });

  // Create demo customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      contact: {
        email: 'alice@example.com',
        phone: '+1-555-234-5678',
      },
      address: {
        street: '456 Oak Ave',
        city: 'Demo City',
        state: 'NY',
        postalCode: '12345',
        country: 'US',
      },
      tags: ['regular', 'corporate'],
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      firstName: 'Bob',
      lastName: 'Smith',
      contact: {
        email: 'bob@example.com',
        phone: '+1-555-345-6789',
      },
      tags: ['walk-in'],
    },
  });

  // Create demo devices
  const device1 = await prisma.device.create({
    data: {
      customerId: customer1.id,
      organizationId: organization.id,
      type: 'SMARTPHONE',
      make: 'Apple',
      model: 'iPhone 14 Pro',
      serialNumber: 'ABC123456789',
      color: 'Space Black',
      storageCapacity: '256GB',
      condition: 'GOOD',
      accessories: ['Charging Cable', 'Case'],
    },
  });

  const device2 = await prisma.device.create({
    data: {
      customerId: customer2.id,
      organizationId: organization.id,
      type: 'LAPTOP',
      make: 'Dell',
      model: 'XPS 13',
      serialNumber: 'DEF987654321',
      color: 'Silver',
      condition: 'FAIR',
    },
  });

  // Create demo inventory items
  const inventoryItem1 = await prisma.inventoryItem.create({
    data: {
      organizationId: organization.id,
      sku: 'SCREEN-IPH14-PRO',
      name: 'iPhone 14 Pro Screen Assembly',
      description: 'Original quality screen assembly for iPhone 14 Pro',
      category: 'Parts',
      manufacturer: 'Apple',
      model: 'iPhone 14 Pro',
      cost: { amount: 15000, currency: 'USD' }, // $150.00 in cents
      price: { amount: 25000, currency: 'USD' }, // $250.00 in cents
      quantity: 5,
      reorderLevel: 2,
      location: 'Shelf A-1',
      supplier: 'Mobile Parts Inc',
      tags: ['apple', 'screen', 'iphone'],
    },
  });

  const inventoryItem2 = await prisma.inventoryItem.create({
    data: {
      organizationId: organization.id,
      sku: 'BATTERY-DELL-XPS13',
      name: 'Dell XPS 13 Battery',
      description: 'Replacement battery for Dell XPS 13',
      category: 'Parts',
      manufacturer: 'Dell',
      model: 'XPS 13',
      cost: { amount: 8000, currency: 'USD' }, // $80.00 in cents
      price: { amount: 12000, currency: 'USD' }, // $120.00 in cents
      quantity: 3,
      reorderLevel: 1,
      location: 'Shelf B-2',
      supplier: 'Laptop Parts Direct',
      tags: ['dell', 'battery', 'laptop'],
    },
  });

  // Create demo tickets
  await prisma.ticket.create({
    data: {
      ticketNumber: 'T-2024-001',
      organizationId: organization.id,
      customerId: customer1.id,
      deviceId: device1.id,
      title: 'Cracked Screen Repair',
      description: 'iPhone 14 Pro screen is cracked and needs replacement',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedTo: user.id,
      problemDescription: 'Customer dropped phone, screen is cracked but still functional',
      slaTargetAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      tags: ['screen-repair', 'urgent'],
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'T-2024-002',
      organizationId: organization.id,
      customerId: customer2.id,
      deviceId: device2.id,
      title: 'Battery Replacement',
      description: 'Dell XPS 13 battery not holding charge',
      status: 'NEW',
      priority: 'MEDIUM',
      problemDescription: 'Battery drains quickly, laptop shuts down unexpectedly',
      slaTargetAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      tags: ['battery', 'hardware'],
    },
  });

  console.log('Database seeded successfully!');
  console.log('Demo login credentials:');
  console.log('Email: owner@demorepairshop.com');
  console.log('Password: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });