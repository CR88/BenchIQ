# BenchIQ - Repair Shop Management System

A modern, full-stack SaaS application for computer and phone repair shops, built with Next.js, NestJS, and PostgreSQL.

## 🚀 Features

### Free Plan
- **Single User**: 1 active user account
- **Unlimited**: Customers, repair tickets, invoices, estimates
- **Core Modules**: CRM, ticket tracking, inventory management, invoicing

### Pro Plan (Coming Soon)
- Multiple users with role-based access
- Advanced dashboards and reporting
- Customer map with geocoding
- Scheduling and calendar integration
- POS features
- Automated workflows and notifications
- Payment gateway integrations

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, TanStack Query, Tailwind CSS
- **Backend**: NestJS with TypeScript, Prisma ORM
- **Database**: PostgreSQL with row-level security
- **Auth**: JWT tokens with refresh mechanism
- **Monorepo**: Organized with shared packages for types and UI components

## 📦 Project Structure

```
├── apps/
│   ├── api/          # NestJS backend API
│   └── web/          # Next.js frontend
├── packages/
│   ├── types/        # Shared TypeScript types and Zod schemas
│   └── ui/           # Shared UI components
├── infra/           # Docker and infrastructure files
└── docs/            # Documentation
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd benchiq
   npm install
   ```

2. **Start development services**:
   ```bash
   # Start PostgreSQL and Redis
   npm run docker:up

   # Run database migrations and seed data
   npm run db:migrate
   npm run db:seed
   ```

3. **Start development servers**:
   ```bash
   # Start both API and web apps
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - Database Studio: `npm run db:studio`

### Demo Credentials

```
Email: owner@demorepairshop.com
Password: password123
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start all development servers
- `npm run build` - Build all applications
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### API (`apps/api`)
- `npm run dev --workspace=apps/api` - Start API development server
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

### Web (`apps/web`)
- `npm run dev --workspace=apps/web` - Start web development server
- `npm run build --workspace=apps/web` - Build web application

## 🗃️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Organizations**: Multi-tenant structure with plan limits
- **Users**: Role-based access (Owner, Admin, Technician, Viewer)
- **Customers**: Contact information and device tracking
- **Devices**: Hardware details and condition tracking
- **Tickets**: Repair workflow management
- **Inventory**: Parts and supplies management
- **Estimates/Invoices**: Billing and payment tracking

## 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Row-level security (RLS) for multi-tenant data isolation
- Role-based access control (RBAC)
- Password hashing with bcrypt
- API rate limiting and validation

## 🚀 Deployment

### Production Environment Variables

Create `.env` files in both `apps/api` and `apps/web`:

**API (.env)**:
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
NODE_ENV="production"
```

**Web (.env.local)**:
```env
NEXT_PUBLIC_API_URL="https://your-api-domain.com/api/v1"
```

### Docker Deployment

1. Build the applications:
   ```bash
   npm run build
   ```

2. Deploy using your preferred platform (Fly.io, Railway, etc.)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=apps/api
npm run test --workspace=apps/web
```

## 📖 API Documentation

The API documentation is available at `/api/docs` when running the development server. It includes:

- Interactive Swagger UI
- Request/response schemas
- Authentication examples
- Rate limiting information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bug reports or feature requests
- Check the [documentation](docs/) for detailed guides
- Review the [API documentation](http://localhost:3001/api/docs) for integration help

---

Built with ❤️ for repair shop owners who deserve better tools.