import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DIRECT_DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function hoursFromNow(n: number) {
  const d = new Date()
  d.setHours(d.getHours() + n)
  return d
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

let ticketCounter = 0
function nextTicketNumber() {
  ticketCounter++
  return `TK-${String(ticketCounter).padStart(5, "0")}`
}

async function main() {
  // Clean existing data (reverse order of dependencies)
  await prisma.payment.deleteMany()
  await prisma.saleLineItem.deleteMany()
  await prisma.saleTransaction.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.ticketLineItem.deleteMany()
  await prisma.ticketNote.deleteMany()
  await prisma.ticketHistory.deleteMany()
  await prisma.ticketAssignment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.stockItem.deleteMany()
  await prisma.storageLocation.deleteMany()
  await prisma.device.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.userStore.deleteMany()
  await prisma.user.deleteMany()
  await prisma.store.deleteMany()
  await prisma.organization.deleteMany()

  const hashedPassword = await bcrypt.hash("password123", 12)

  // ── Organization ──────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "Demo Repairs",
      slug: "demo-repairs",
      email: "info@demorepairs.com",
      phone: "020 7946 0958",
      website: "https://demorepairs.com",
      defaultCurrency: "GBP",
      taxRate: 0.20,
    },
  })

  // ── Stores ────────────────────────────────────────────────
  const mainStore = await prisma.store.create({
    data: {
      orgId: org.id,
      name: "Main Store",
      slug: "main-store",
      address: "123 High Street",
      city: "London",
      postcode: "SW1A 1AA",
      phone: "020 7946 0958",
      email: "main@demorepairs.com",
    },
  })

  // ── Users ─────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "admin@demorepairs.com",
      name: "Craig Ryder",
      hashedPassword,
      role: "ADMIN",
    },
  })

  const tech1 = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "jake@demorepairs.com",
      name: "Jake Mitchell",
      hashedPassword,
      role: "TECHNICIAN",
    },
  })

  const tech2 = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "sarah@demorepairs.com",
      name: "Sarah Chen",
      hashedPassword,
      role: "TECHNICIAN",
    },
  })

  const staff = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "reception@demorepairs.com",
      name: "Amy Wilson",
      hashedPassword,
      role: "STAFF",
    },
  })

  const allUsers = [admin, tech1, tech2, staff]
  const techs = [tech1, tech2]

  for (const user of allUsers) {
    await prisma.userStore.create({
      data: { userId: user.id, storeId: mainStore.id },
    })
  }

  // ── Customers ─────────────────────────────────────────────
  const customerData = [
    { firstName: "James", lastName: "Thompson", email: "james.t@gmail.com", phone: "07700 900123", city: "London", postcode: "E1 6AN" },
    { firstName: "Emma", lastName: "Williams", email: "emma.w@outlook.com", phone: "07700 900456", city: "London", postcode: "N1 9GU" },
    { firstName: "Oliver", lastName: "Brown", email: "oliver.b@yahoo.com", phone: "07700 900789", city: "London", postcode: "SE1 7PB" },
    { firstName: "Sophie", lastName: "Davis", email: "sophie.d@gmail.com", phone: "07700 900234", city: "London", postcode: "W1D 3QF" },
    { firstName: "Harry", lastName: "Wilson", email: "harry.w@icloud.com", phone: "07700 900567", city: "London", postcode: "EC2R 8AH" },
    { firstName: "Charlotte", lastName: "Taylor", email: "charlotte.t@gmail.com", phone: "07700 900890", city: "London", postcode: "SW3 1AA" },
    { firstName: "George", lastName: "Anderson", email: "george.a@hotmail.com", phone: "07700 900345", city: "London", postcode: "NW1 4RY" },
    { firstName: "Amelia", lastName: "Thomas", email: "amelia.t@gmail.com", phone: "07700 900678", city: "London", postcode: "W2 1JB" },
    { firstName: "Jack", lastName: "Roberts", email: "jack.r@outlook.com", phone: "07700 900901", city: "London", postcode: "SE10 9HT" },
    { firstName: "Isla", lastName: "Clark", email: "isla.c@gmail.com", phone: "07700 900112", city: "London", postcode: "SW11 1NP" },
    { firstName: "Noah", lastName: "Wright", email: "noah.w@yahoo.com", phone: "07700 900334", city: "London", postcode: "E14 5HP" },
    { firstName: "Mia", lastName: "Walker", email: "mia.w@gmail.com", phone: "07700 900556", city: "London", postcode: "N7 8DP" },
    { firstName: "Leo", lastName: "Hall", email: "leo.h@icloud.com", phone: "07700 900778", city: "London", postcode: "W6 0QT" },
    { firstName: "Grace", lastName: "Young", email: "grace.y@gmail.com", phone: "07700 900990", city: "London", postcode: "SE15 5BA" },
    { firstName: "Freddie", lastName: "King", email: "freddie.k@hotmail.com", phone: "07700 900221", city: "London", postcode: "NW3 4ST" },
  ]

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.customer.create({
        data: { orgId: org.id, ...c },
      })
    )
  )

  // ── Devices ───────────────────────────────────────────────
  const deviceData = [
    { type: "Phone", brand: "Apple", model: "iPhone 15 Pro", color: "Natural Titanium" },
    { type: "Phone", brand: "Apple", model: "iPhone 14", color: "Blue" },
    { type: "Phone", brand: "Apple", model: "iPhone 13", color: "Midnight" },
    { type: "Phone", brand: "Samsung", model: "Galaxy S24 Ultra", color: "Titanium Gray" },
    { type: "Phone", brand: "Samsung", model: "Galaxy S23", color: "Phantom Black" },
    { type: "Phone", brand: "Samsung", model: "Galaxy A54", color: "Lime" },
    { type: "Phone", brand: "Google", model: "Pixel 8 Pro", color: "Obsidian" },
    { type: "Tablet", brand: "Apple", model: "iPad Pro 12.9\"", color: "Space Gray" },
    { type: "Tablet", brand: "Apple", model: "iPad Air", color: "Starlight" },
    { type: "Tablet", brand: "Samsung", model: "Galaxy Tab S9", color: "Graphite" },
    { type: "Laptop", brand: "Apple", model: "MacBook Air M2", color: "Midnight" },
    { type: "Laptop", brand: "Apple", model: "MacBook Pro 14\"", color: "Silver" },
    { type: "Phone", brand: "Apple", model: "iPhone 15", color: "Pink" },
    { type: "Phone", brand: "OnePlus", model: "12", color: "Flowy Emerald" },
    { type: "Watch", brand: "Apple", model: "Apple Watch Ultra 2", color: "Titanium" },
    { type: "Phone", brand: "Apple", model: "iPhone 12", color: "Green" },
    { type: "Console", brand: "Nintendo", model: "Switch OLED", color: "White" },
    { type: "Phone", brand: "Apple", model: "iPhone 14 Pro Max", color: "Deep Purple" },
  ]

  const devices = await Promise.all(
    deviceData.map((d, i) =>
      prisma.device.create({
        data: {
          orgId: org.id,
          customerId: customers[i % customers.length].id,
          ...d,
          serialNumber: `SN${String(1000 + i)}`,
        },
      })
    )
  )

  // ── Products (parts & services) ───────────────────────────
  const productData = [
    { sku: "SCR-IP15P", name: "iPhone 15 Pro Screen Assembly", category: "Screens", costPrice: 45.00, retailPrice: 89.99, reorderPoint: 3 },
    { sku: "SCR-IP14", name: "iPhone 14 Screen Assembly", category: "Screens", costPrice: 35.00, retailPrice: 69.99, reorderPoint: 5 },
    { sku: "SCR-IP13", name: "iPhone 13 Screen Assembly", category: "Screens", costPrice: 28.00, retailPrice: 59.99, reorderPoint: 5 },
    { sku: "SCR-S24U", name: "Galaxy S24 Ultra Screen", category: "Screens", costPrice: 65.00, retailPrice: 129.99, reorderPoint: 2 },
    { sku: "SCR-S23", name: "Galaxy S23 Screen", category: "Screens", costPrice: 42.00, retailPrice: 84.99, reorderPoint: 3 },
    { sku: "BAT-IP15P", name: "iPhone 15 Pro Battery", category: "Batteries", costPrice: 12.00, retailPrice: 34.99, reorderPoint: 5 },
    { sku: "BAT-IP14", name: "iPhone 14 Battery", category: "Batteries", costPrice: 10.00, retailPrice: 29.99, reorderPoint: 5 },
    { sku: "BAT-S24U", name: "Galaxy S24 Ultra Battery", category: "Batteries", costPrice: 15.00, retailPrice: 39.99, reorderPoint: 3 },
    { sku: "CHG-USB-C", name: "USB-C Charging Port Assembly", category: "Charging", costPrice: 5.00, retailPrice: 24.99, reorderPoint: 10 },
    { sku: "CHG-LIGHT", name: "Lightning Port Assembly", category: "Charging", costPrice: 6.00, retailPrice: 24.99, reorderPoint: 8 },
    { sku: "CAM-IP15P", name: "iPhone 15 Pro Rear Camera", category: "Cameras", costPrice: 35.00, retailPrice: 74.99, reorderPoint: 2 },
    { sku: "SPK-UNIV", name: "Universal Speaker Module", category: "Audio", costPrice: 3.50, retailPrice: 19.99, reorderPoint: 10 },
    { sku: "CASE-IP15", name: "iPhone 15 Clear Case", category: "Accessories", costPrice: 2.50, retailPrice: 14.99, reorderPoint: 15 },
    { sku: "SPR-UNIV", name: "Universal Screen Protector", category: "Accessories", costPrice: 1.00, retailPrice: 9.99, reorderPoint: 20 },
    { sku: "SVC-DIAG", name: "Diagnostic Service", category: "Services", costPrice: 0, retailPrice: 19.99, isService: true },
    { sku: "SVC-LABOR", name: "Standard Repair Labour (1hr)", category: "Services", costPrice: 0, retailPrice: 49.99, isService: true },
    { sku: "SVC-DATA", name: "Data Recovery Service", category: "Services", costPrice: 0, retailPrice: 79.99, isService: true },
  ]

  const products = await Promise.all(
    productData.map((p) =>
      prisma.product.create({
        data: {
          orgId: org.id,
          ...p,
          isService: p.isService ?? false,
        },
      })
    )
  )

  // ── Stock Items ───────────────────────────────────────────
  const physicalProducts = products.filter((_, i) => !productData[i].isService)
  await Promise.all(
    physicalProducts.map((p, i) =>
      prisma.stockItem.create({
        data: {
          productId: p.id,
          storeId: mainStore.id,
          quantity: Math.floor(Math.random() * 15) + 1,
        },
      })
    )
  )

  // ── Suppliers ─────────────────────────────────────────────
  const supplier1 = await prisma.supplier.create({
    data: {
      orgId: org.id,
      name: "MobileParts UK",
      contactName: "David Chen",
      email: "orders@mobilepartsuk.com",
      phone: "0121 496 0123",
      website: "https://mobilepartsuk.com",
      notes: "Main screen supplier. 2-3 day delivery. Net 30 terms.",
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      orgId: org.id,
      name: "TechFix Wholesale",
      contactName: "Rebecca Patel",
      email: "wholesale@techfix.co.uk",
      phone: "0161 789 0456",
      website: "https://techfixwholesale.co.uk",
      notes: "Good for batteries and small parts. Free shipping over 100.",
    },
  })

  // ── Purchase Orders ───────────────────────────────────────
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-00001",
      orgId: org.id,
      supplierId: supplier1.id,
      status: "RECEIVED",
      orderedAt: daysAgo(14),
      expectedAt: daysAgo(7),
      receivedAt: daysAgo(6),
      totalCost: 350.00,
      items: {
        create: [
          { productId: products[0].id, quantity: 5, unitCost: 45.00, receivedQty: 5 },
          { productId: products[1].id, quantity: 5, unitCost: 35.00, receivedQty: 5 },
        ],
      },
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-00002",
      orgId: org.id,
      supplierId: supplier2.id,
      status: "ORDERED",
      orderedAt: daysAgo(2),
      expectedAt: hoursFromNow(48),
      totalCost: 125.00,
      notes: "Urgent - need batteries for backlog",
      items: {
        create: [
          { productId: products[5].id, quantity: 10, unitCost: 12.00 },
          { productId: products[8].id, quantity: 5, unitCost: 5.00 },
        ],
      },
    },
  })

  // ── Storage Locations ─────────────────────────────────────
  const locations = await Promise.all(
    [
      { zone: "A", shelf: "1", bin: "1", label: "A-1-1" },
      { zone: "A", shelf: "1", bin: "2", label: "A-1-2" },
      { zone: "A", shelf: "2", bin: "1", label: "A-2-1" },
      { zone: "A", shelf: "2", bin: "2", label: "A-2-2" },
      { zone: "B", shelf: "1", bin: "1", label: "B-1-1" },
      { zone: "B", shelf: "1", bin: "2", label: "B-1-2" },
      { zone: "B", shelf: "2", bin: "1", label: "B-2-1" },
      { zone: "B", shelf: "2", bin: "2", label: "B-2-2" },
    ].map((loc) =>
      prisma.storageLocation.create({
        data: { storeId: mainStore.id, ...loc },
      })
    )
  )

  // ── Tickets ───────────────────────────────────────────────
  type SeedTicket = {
    customer: number; device: number; status: string; priority: string
    title: string; description?: string; diagnosis?: string
    estimatedCost?: number; actualCost?: number
    created: Date; completed?: Date; pickedUp?: Date
    condition: string; tech?: number; location?: number
  }
  const ticketsData: SeedTicket[] = [
    // COMPLETE tickets (past)
    {
      customer: 0, device: 0, status: "COMPLETE" as const, priority: "NORMAL" as const,
      title: "Cracked screen replacement", description: "Customer dropped phone, front glass shattered. LCD still works.",
      diagnosis: "Front glass cracked, LCD intact. Standard screen swap.",
      estimatedCost: 89.99, actualCost: 89.99,
      created: daysAgo(21), completed: daysAgo(19), pickedUp: daysAgo(18),
      condition: "DAMAGED" as const, tech: 0, location: 0,
    },
    {
      customer: 1, device: 1, status: "COMPLETE" as const, priority: "HIGH" as const,
      title: "Battery replacement - swelling", description: "Battery visibly swollen, phone won't charge past 40%.",
      diagnosis: "Battery degraded, 67% health. Replaced with OEM battery.",
      estimatedCost: 49.99, actualCost: 49.99,
      created: daysAgo(18), completed: daysAgo(17), pickedUp: daysAgo(16),
      condition: "FAIR" as const, tech: 1, location: 1,
    },
    {
      customer: 2, device: 2, status: "COMPLETE" as const, priority: "NORMAL" as const,
      title: "Charging port not working", description: "Phone won't charge with any cable. Tried multiple cables and chargers.",
      diagnosis: "Lint buildup in port + damaged pins. Cleaned and replaced port.",
      estimatedCost: 44.99, actualCost: 24.99,
      created: daysAgo(15), completed: daysAgo(14), pickedUp: daysAgo(14),
      condition: "GOOD" as const, tech: 0, location: 2,
    },
    {
      customer: 3, device: 3, status: "COMPLETE" as const, priority: "URGENT" as const,
      title: "Water damage recovery", description: "Phone fell in sink. Screen flickering, speaker muffled.",
      diagnosis: "Corrosion on logic board connectors. Ultrasonic cleaned, replaced speaker.",
      estimatedCost: 149.99, actualCost: 129.99,
      created: daysAgo(12), completed: daysAgo(9), pickedUp: daysAgo(8),
      condition: "DAMAGED" as const, tech: 1, location: 3,
    },
    {
      customer: 4, device: 4, status: "COMPLETE" as const, priority: "NORMAL" as const,
      title: "Screen replacement", description: "Cracked screen from drop.",
      diagnosis: "Full screen assembly replacement needed.",
      estimatedCost: 84.99, actualCost: 84.99,
      created: daysAgo(10), completed: daysAgo(8), pickedUp: daysAgo(7),
      condition: "DAMAGED" as const, tech: 0, location: 4,
    },

    // READY_FOR_PICKUP
    {
      customer: 5, device: 5, status: "READY_FOR_PICKUP" as const, priority: "NORMAL" as const,
      title: "Screen replacement", description: "Cracked screen, touch still works but glass sharp on edges.",
      diagnosis: "Screen assembly replacement. Applied new screen protector.",
      estimatedCost: 59.99, actualCost: 59.99,
      created: daysAgo(5), completed: daysAgo(1),
      condition: "DAMAGED" as const, tech: 0, location: 5,
    },
    {
      customer: 6, device: 6, status: "READY_FOR_PICKUP" as const, priority: "HIGH" as const,
      title: "Rear camera not focusing", description: "Camera blurry on all modes. Tried reset, no improvement.",
      diagnosis: "OIS module failed. Replaced rear camera assembly.",
      estimatedCost: 74.99, actualCost: 74.99,
      created: daysAgo(4), completed: daysAgo(0),
      condition: "GOOD" as const, tech: 1, location: 6,
    },

    // IN_REPAIR
    {
      customer: 7, device: 7, status: "IN_REPAIR" as const, priority: "NORMAL" as const,
      title: "iPad screen replacement", description: "Cracked glass, digitizer still responsive.",
      diagnosis: "Digitizer cracked, LCD fine. Need to replace glass only.",
      estimatedCost: 119.99,
      created: daysAgo(3),
      condition: "DAMAGED" as const, tech: 0, location: 7,
    },
    {
      customer: 8, device: 8, status: "IN_REPAIR" as const, priority: "HIGH" as const,
      title: "Won't turn on", description: "iPad Air completely dead. Was working fine yesterday.",
      diagnosis: "Tristar IC failure. Board-level repair needed.",
      estimatedCost: 89.99,
      created: daysAgo(2),
      condition: "FAIR" as const, tech: 1,
    },

    // WAITING_PARTS
    {
      customer: 9, device: 9, status: "WAITING_PARTS" as const, priority: "NORMAL" as const,
      title: "Screen and digitizer replacement", description: "Dropped tablet, screen completely black.",
      diagnosis: "LCD and digitizer both damaged. Ordered replacement panel.",
      estimatedCost: 149.99,
      created: daysAgo(4),
      condition: "DAMAGED" as const, tech: 0,
    },
    {
      customer: 10, device: 10, status: "WAITING_PARTS" as const, priority: "LOW" as const,
      title: "Keyboard replacement", description: "Several keys not registering. Butterfly mechanism.",
      diagnosis: "3 butterfly switches failed. Ordered keyboard assembly.",
      estimatedCost: 199.99,
      created: daysAgo(6),
      condition: "FAIR" as const, tech: 1,
    },

    // DIAGNOSED
    {
      customer: 11, device: 11, status: "DIAGNOSED" as const, priority: "NORMAL" as const,
      title: "Battery draining fast", description: "MacBook Pro only lasts 2 hours on full charge.",
      diagnosis: "Battery cycle count 1247. Needs replacement. Quoted customer.",
      estimatedCost: 159.99,
      created: daysAgo(1),
      condition: "GOOD" as const, tech: 0,
    },

    // QA
    {
      customer: 12, device: 12, status: "QA" as const, priority: "NORMAL" as const,
      title: "Screen replacement", description: "Cracked front glass.",
      diagnosis: "Standard screen swap complete. Running QA checks.",
      estimatedCost: 69.99, actualCost: 69.99,
      created: daysAgo(3),
      condition: "DAMAGED" as const, tech: 1,
    },

    // RECEIVED (new, undiagnosed)
    {
      customer: 13, device: 13, status: "RECEIVED" as const, priority: "NORMAL" as const,
      title: "Phone overheating", description: "Gets very hot during normal use. Battery drains quickly.",
      created: daysAgo(0),
      condition: "GOOD" as const,
    },
    {
      customer: 14, device: 14, status: "RECEIVED" as const, priority: "URGENT" as const,
      title: "Watch won't pair", description: "Apple Watch not connecting to iPhone after update.",
      created: daysAgo(0),
      condition: "EXCELLENT" as const,
    },
    {
      customer: 0, device: 15, status: "RECEIVED" as const, priority: "LOW" as const,
      title: "Back glass replacement", description: "Cracked rear glass, cosmetic only.",
      created: daysAgo(0),
      condition: "FAIR" as const,
    },

    // CANCELLED
    {
      customer: 3, device: 16, status: "CANCELLED" as const, priority: "NORMAL" as const,
      title: "Joycon drift repair", description: "Left joycon drifting. Customer decided to buy new joycons instead.",
      created: daysAgo(7),
      condition: "FAIR" as const,
    },
  ]

  const tickets = []
  for (const t of ticketsData) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: nextTicketNumber(),
        orgId: org.id,
        storeId: mainStore.id,
        customerId: customers[t.customer].id,
        deviceId: devices[t.device].id,
        status: t.status as any,
        priority: t.priority as any,
        title: t.title,
        description: t.description,
        diagnosis: t.diagnosis,
        estimatedCost: t.estimatedCost,
        actualCost: t.actualCost,
        conditionOnIntake: t.condition as any,
        completedAt: t.completed,
        pickedUpAt: t.pickedUp,
        createdAt: t.created,
        storageLocationId: t.location !== undefined ? locations[t.location].id : undefined,
      },
    })
    tickets.push(ticket)

    // Assign technician
    if (t.tech !== undefined) {
      await prisma.ticketAssignment.create({
        data: { ticketId: ticket.id, userId: techs[t.tech].id },
      })
    }

    // Status history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: staff.id,
        toStatus: "RECEIVED",
        note: "Ticket created at intake",
        createdAt: t.created,
      },
    })

    if (t.diagnosis) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: t.tech !== undefined ? techs[t.tech].id : admin.id,
          fromStatus: "RECEIVED",
          toStatus: "DIAGNOSED",
          createdAt: new Date(t.created.getTime() + 2 * 60 * 60 * 1000),
        },
      })
    }

    if (t.status === "COMPLETE" || t.status === "READY_FOR_PICKUP" || t.status === "QA") {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: t.tech !== undefined ? techs[t.tech].id : admin.id,
          fromStatus: "IN_REPAIR",
          toStatus: t.status === "QA" ? "QA" : "READY_FOR_PICKUP",
          createdAt: t.completed || new Date(t.created.getTime() + 24 * 60 * 60 * 1000),
        },
      })
    }

    if (t.status === "COMPLETE") {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: staff.id,
          fromStatus: "READY_FOR_PICKUP",
          toStatus: "COMPLETE",
          note: "Customer collected device",
          createdAt: t.pickedUp || t.completed!,
        },
      })
    }
  }

  // ── Ticket Notes ──────────────────────────────────────────
  const noteData = [
    { ticket: 0, user: tech1, content: "Screen removed. No damage to frame. Clean swap.", internal: true },
    { ticket: 0, user: tech1, content: "New screen fitted and tested. All touch zones responding.", internal: true },
    { ticket: 0, user: staff, content: "Customer notified - ready for collection.", internal: false },
    { ticket: 3, user: tech2, content: "Significant corrosion on board. Ultrasonic bath for 15 mins.", internal: true },
    { ticket: 3, user: tech2, content: "Board cleaned. Testing overnight to confirm stability.", internal: true },
    { ticket: 3, user: admin, content: "Revised quote sent to customer - lower than estimate.", internal: false },
    { ticket: 7, user: tech1, content: "Heat gun applied, old screen coming off cleanly.", internal: true },
    { ticket: 8, user: tech2, content: "Confirmed Tristar IC. Need microscope work.", internal: true },
    { ticket: 9, user: tech1, content: "Part ordered from MobileParts UK. ETA 3 days.", internal: true },
    { ticket: 10, user: tech2, content: "Keyboard assembly on backorder. Supplier says 5-7 days.", internal: true },
    { ticket: 11, user: tech1, content: "Customer approved quote. Will proceed when part arrives.", internal: false },
  ]

  for (const n of noteData) {
    await prisma.ticketNote.create({
      data: {
        ticketId: tickets[n.ticket].id,
        userId: n.user.id,
        content: n.content,
        isInternal: n.internal,
      },
    })
  }

  // ── Ticket Line Items ─────────────────────────────────────
  const lineItemData = [
    { ticket: 0, product: 0, desc: "iPhone 15 Pro Screen Assembly", qty: 1, price: 89.99 },
    { ticket: 1, product: 5, desc: "iPhone 14 Battery", qty: 1, price: 29.99 },
    { ticket: 1, product: 15, desc: "Standard Repair Labour (1hr)", qty: 1, price: 20.00, isLabor: true },
    { ticket: 2, product: 9, desc: "Lightning Port Assembly", qty: 1, price: 24.99 },
    { ticket: 3, product: 11, desc: "Universal Speaker Module", qty: 1, price: 19.99 },
    { ticket: 3, product: 15, desc: "Standard Repair Labour (1hr)", qty: 2, price: 49.99, isLabor: true },
    { ticket: 3, product: 14, desc: "Diagnostic Service", qty: 1, price: 19.99, isLabor: true },
    { ticket: 4, product: 4, desc: "Galaxy S23 Screen", qty: 1, price: 84.99 },
    { ticket: 5, product: 2, desc: "iPhone 13 Screen Assembly", qty: 1, price: 59.99 },
    { ticket: 6, product: 10, desc: "iPhone 15 Pro Rear Camera", qty: 1, price: 74.99 },
    { ticket: 12, product: 1, desc: "iPhone 14 Screen Assembly", qty: 1, price: 69.99 },
  ]

  for (const li of lineItemData) {
    await prisma.ticketLineItem.create({
      data: {
        ticketId: tickets[li.ticket].id,
        productId: products[li.product].id,
        description: li.desc,
        quantity: li.qty,
        unitPrice: li.price,
        isLabor: li.isLabor ?? false,
      },
    })
  }

  // ── Invoices (for completed tickets) ──────────────────────
  const invoiceData = [
    { ticket: 0, number: "INV-00001", subtotal: 89.99, status: "PAID" as const, paidDaysAgo: 18 },
    { ticket: 1, number: "INV-00002", subtotal: 49.99, status: "PAID" as const, paidDaysAgo: 16 },
    { ticket: 2, number: "INV-00003", subtotal: 24.99, status: "PAID" as const, paidDaysAgo: 14 },
    { ticket: 3, number: "INV-00004", subtotal: 129.99, status: "PAID" as const, paidDaysAgo: 8 },
    { ticket: 4, number: "INV-00005", subtotal: 84.99, status: "PAID" as const, paidDaysAgo: 7 },
  ]

  for (const inv of invoiceData) {
    const taxAmount = Number((inv.subtotal * 0.20).toFixed(2))
    const total = Number((inv.subtotal + taxAmount).toFixed(2))

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: inv.number,
        orgId: org.id,
        storeId: mainStore.id,
        ticketId: tickets[inv.ticket].id,
        customerId: tickets[inv.ticket].customerId,
        status: inv.status,
        subtotal: inv.subtotal,
        taxAmount,
        total,
        paidAt: daysAgo(inv.paidDaysAgo),
        dueDate: daysAgo(inv.paidDaysAgo - 14),
      },
    })

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: total,
        method: randomItem(["CASH", "CARD", "CARD", "CARD"] as const),
        paidAt: daysAgo(inv.paidDaysAgo),
      },
    })
  }

  // ── Appointments ──────────────────────────────────────────
  const appointmentData = [
    { title: "iPhone screen repair - James T", customer: 0, tech: tech1, start: hoursFromNow(2), end: hoursFromNow(3), status: "CONFIRMED" as const },
    { title: "iPad diagnostic - Amelia T", customer: 7, tech: tech2, start: hoursFromNow(4), end: hoursFromNow(5), status: "SCHEDULED" as const },
    { title: "MacBook battery quote", customer: 11, tech: tech1, start: hoursFromNow(26), end: hoursFromNow(27), status: "SCHEDULED" as const },
    { title: "Samsung screen repair", customer: 4, tech: tech2, start: hoursFromNow(28), end: hoursFromNow(29.5), status: "SCHEDULED" as const },
    { title: "Walk-in diagnostic", tech: tech1, start: hoursFromNow(50), end: hoursFromNow(51), status: "SCHEDULED" as const },
    { title: "Data recovery consultation", customer: 10, tech: tech2, start: hoursFromNow(52), end: hoursFromNow(53), status: "SCHEDULED" as const },
    // Past appointments
    { title: "Water damage assessment - Sophie D", customer: 3, tech: tech2, start: daysAgo(12), end: new Date(daysAgo(12).getTime() + 60 * 60 * 1000), status: "COMPLETED" as const },
    { title: "Screen repair - Oliver B", customer: 2, tech: tech1, start: daysAgo(15), end: new Date(daysAgo(15).getTime() + 45 * 60 * 1000), status: "COMPLETED" as const },
  ]

  for (const appt of appointmentData) {
    await prisma.appointment.create({
      data: {
        storeId: mainStore.id,
        title: appt.title,
        technicianId: appt.tech.id,
        startTime: appt.start,
        endTime: appt.end,
        status: appt.status,
      },
    })
  }

  // ── POS Sale Transactions ─────────────────────────────────
  const saleData = [
    { customer: 0, items: [{ product: 12, desc: "iPhone 15 Clear Case", qty: 1, price: 14.99 }, { product: 13, desc: "Universal Screen Protector", qty: 2, price: 9.99 }], daysAgo: 18, method: "CARD" as const },
    { customer: 5, items: [{ product: 13, desc: "Universal Screen Protector", qty: 1, price: 9.99 }], daysAgo: 1, method: "CASH" as const },
    { customer: 8, items: [{ product: 12, desc: "iPhone 15 Clear Case", qty: 1, price: 14.99 }, { product: 13, desc: "Universal Screen Protector", qty: 1, price: 9.99 }], daysAgo: 5, method: "CARD" as const },
  ]

  for (const sale of saleData) {
    const subtotal = sale.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const taxAmount = Number((subtotal * 0.20).toFixed(2))
    const total = Number((subtotal + taxAmount).toFixed(2))

    await prisma.saleTransaction.create({
      data: {
        storeId: mainStore.id,
        userId: staff.id,
        customerId: customers[sale.customer].id,
        subtotal,
        taxAmount,
        total,
        paymentMethod: sale.method,
        createdAt: daysAgo(sale.daysAgo),
        lineItems: {
          create: sale.items.map((i) => ({
            productId: products[i.product].id,
            description: i.desc,
            quantity: i.qty,
            unitPrice: i.price,
          })),
        },
      },
    })
  }

  // Mark occupied storage locations
  for (const t of ticketsData) {
    if (t.location !== undefined && t.status !== "COMPLETE" && t.status !== "CANCELLED") {
      await prisma.storageLocation.update({
        where: { id: locations[t.location].id },
        data: { isOccupied: true },
      })
    }
  }

  console.log("Seeded successfully!")
  console.log("  - 1 org, 1 store")
  console.log("  - 4 users (admin, 2 techs, 1 staff)")
  console.log("  - 15 customers, 18 devices")
  console.log("  - 17 tickets across all statuses")
  console.log("  - 17 products (14 parts + 3 services)")
  console.log("  - 2 suppliers, 2 purchase orders")
  console.log("  - 5 invoices with payments")
  console.log("  - 8 appointments")
  console.log("  - 3 POS transactions")
  console.log("  - 8 storage locations")
  console.log("")
  console.log("Login: admin@demorepairs.com / password123")
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
