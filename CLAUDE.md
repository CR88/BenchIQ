# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BenchIQ is a repair shop management system built as a modern SaaS application for computer and phone repair shops. It's a monorepo using Next.js for frontend, NestJS for backend, and PostgreSQL for database.

## Common Commands

### Fresh Installation Setup (IMPORTANT: Run in this order)
```bash
# 1. Install all dependencies
npm install

# 2. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start PostgreSQL and Redis services
npm run docker:up

# 4. Wait for services to be healthy (check with: docker ps | grep benchiq)

# 5. Run database migrations (creates all tables)
npm run db:migrate

# 6. (Optional) Seed the database with demo data
npm run db:seed

# 7. Start both API and Web in development mode
npm run dev
```

### Regular Development
```bash
# Start services if not running
npm run docker:up

# Start development servers
npm run dev
```

### Individual Service Commands
```bash
# API development (NestJS on port 3001)
npm run dev --workspace=apps/api

# API in mock mode (no database required, uses mock-data.service)
npm run dev:mock --workspace=apps/api

# Web development (Next.js on port 3000)
npm run dev --workspace=apps/web

# Open Prisma Studio to view/edit database
npm run db:studio --workspace=apps/api
```

### Testing & Validation
```bash
# Run all tests (currently no tests implemented)
npm run test

# Type checking
npm run typecheck --workspace=apps/api
npm run typecheck --workspace=apps/web

# Note: Linting is not configured yet
```

### Database Commands
```bash
# Create new migration after schema changes
cd apps/api && npx prisma migrate dev --name <migration_name>

# Deploy migrations in production
cd apps/api && npm run db:migrate:deploy

# Reset database (caution: data loss)
cd apps/api && npx prisma migrate reset
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TanStack Query, Tailwind CSS, Radix UI
- **Backend**: NestJS, TypeScript, Prisma ORM, JWT auth, Passport
- **Database**: PostgreSQL with row-level security
- **Monorepo**: NPM workspaces

### Directory Structure
```
/apps/api/                  # NestJS backend
  /src/
    /admin/                 # Admin-specific endpoints
    /auth/                  # Authentication (JWT + refresh tokens)
    /common/prisma/         # Prisma service wrapper
    /customers/             # Customer management (CRUD operations)
    /dashboard/             # Dashboard stats and analytics
    /devices/               # Device tracking for repairs
    /organizations/         # Multi-tenant org management
    /shared/                # Shared utilities (mock-data.service.ts)
    /tickets/               # Repair ticket workflow
    /users/                 # User management
    main.ts                # Main entry point
    main-mock.ts           # Mock mode (no database required)
    main-demo.ts           # Demo mode entry point
  /prisma/
    schema.prisma          # Database schema (includes Estimate, Invoice, Inventory models)
    seed.ts               # Seed data script

/apps/web/                 # Next.js frontend
  /src/
    /app/                  # App Router pages
      /admin/              # Admin portal
      /auth/               # Authentication pages (login/register)
      /customers/          # Customer management UI
      /dashboard/          # Main dashboard with stats
      /estimates/          # Estimates page (UI only, no backend)
      /inventory/          # Inventory page (UI only, no backend)
      /invoices/           # Invoices page (UI only, no backend)
      /settings/           # Organization settings
      /tickets/            # Active tickets view
    /components/           # Reusable React components
      AddCustomerModal.tsx        # Customer creation modal
      CreateTicketModal.tsx       # Ticket creation modal
      DashboardLayout.tsx         # Layout wrapper with navigation
      FileUploadModal.tsx         # File upload component
      LocationAwareAddressForm.tsx # Address input with geocoding
      Navigation.tsx              # Main navigation sidebar/mobile menu
      PrintableJobSheet.tsx       # Printable ticket/job sheet
      TicketNotesModal.tsx        # Ticket notes interface
    /hooks/                # Custom React hooks (useAuth, etc.)
    /lib/                  # API client and utilities

/packages/                 # Shared packages
  /types/                  # Shared TypeScript types and Zod schemas
  /ui/                     # Shared UI components
/infra/                   # Docker compose for local dev
```

### Key Design Patterns

1. **Multi-tenancy**: Organization-based with row-level security via `organizationId`
2. **Plan Limits**: FREE (1 user) vs PRO (unlimited users) enforced at API level
3. **Authentication**: JWT access tokens + refresh tokens pattern
4. **API Structure**: RESTful endpoints under `/api/v1/*`
5. **Mock Mode**: Alternative entry point (`main-mock.ts`) runs API without database using `mock-data.service.ts` - useful for demo/testing

### Database Schema Highlights

- **Organizations**: Central tenant entity with plan limits
- **Users**: Role-based (OWNER, ADMIN, TECHNICIAN, VIEWER)
- **Tickets**: Core workflow entity with status tracking
- **Inventory**: Parts tracking with automatic adjustments
- **Estimates/Invoices**: Line items, tax calculations, payment tracking
- **Audit Logs**: Change tracking for compliance

### Authentication Flow

1. User logs in with email/password
2. API returns access token (15min) and refresh token (7d)
3. Frontend stores tokens and includes in API requests
4. Auto-refresh when access token expires

### Development Notes

- **API**: Runs on `http://localhost:3001` (listens on 0.0.0.0 for network access)
- **Web**: Runs on `http://localhost:3000`
- **PostgreSQL**: Default port 5432 (use 5434 if conflicts)
- **Redis**: Port 6379 (future use for queues)
- **CORS**: Enabled for all origins in development

### Network Access Setup
For testing on other devices (phones, tablets):
1. Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` to your machine's IP
2. Access web app via `http://YOUR_IP:3000`

### Demo Credentials
```
Email: owner@demorepairshop.com
Password: password123
```

### Important Considerations

- **ESLint**: Not configured - avoid running lint commands
- **Tests**: No test files exist yet - tests need to be implemented
- **TypeScript**: Some type definitions may be missing in API (see SETUP.md for fixes)
- **Database**: Migrations MUST be run on first setup to create tables
- **Ports**: PostgreSQL commonly conflicts - use port 5434 as alternative
- **Navigation**: All pages use DashboardLayout component for consistent navigation

### Current Implementation Status

#### Fully Implemented ✅
- Authentication (login, register, JWT tokens)
- Customer management (CRUD)
- Ticket creation and management
- Dashboard with stats
- Organization settings
- Navigation (desktop sidebar, mobile menu)

#### Database Schema Only (No API Endpoints) ⚠️
- Inventory management (InventoryItem, InventoryAdjustment models exist)
- Estimates (Estimate, EstimateLineItem models exist)
- Invoices (Invoice, InvoiceLineItem, Payment models exist)
- Time tracking (TimeEntry model exists)
- Ticket notes (TicketNote model exists)

#### Not Started ❌
- Email notifications
- File uploads for tickets
- Reports and analytics
- Recurring tickets
- SMS notifications