# BenchIQ Setup Guide

This guide walks you through setting up BenchIQ on a fresh machine after cloning from GitHub.

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

## Quick Setup (Fresh Installation)

```bash
# 1. Clone the repository
git clone <your-github-repo-url>
cd benchIQ/1.0

# 2. Install dependencies
npm install

# 3. Configure environment variables for API
cp apps/api/.env.example apps/api/.env

# 4. Configure environment variables for Web (for network access)
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local if you need network access (replace localhost with your IP)

# 5. Update database port if needed (default is 5432)
# If port 5432 is already in use, edit these files:
# - infra/docker-compose.yml (change "5432:5432" to "5434:5432" or another port)
# - apps/api/.env (update DATABASE_URL port to match)

# 6. Start Docker services (PostgreSQL & Redis)
npm run docker:up

# 7. Wait for services to be healthy (about 30 seconds)
docker ps | grep benchiq

# 8. Run database migrations (creates all tables)
cd apps/api && npx prisma migrate dev --name initial_schema
cd ../..

# 9. (Optional) Seed database with demo data
npm run db:seed

# 10. Start the development servers
npm run dev
```

## Accessing the Application

After setup, you can access:
- **Web Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs (when API is running)

### For Network Access
To make servers accessible on your local network:

1. Create/edit `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://YOUR_IP:3001/api/v1"
   ```
   Replace `YOUR_IP` with your machine's actual IP address (e.g., 192.168.1.100)

2. The API already listens on all interfaces (0.0.0.0) by default

3. Start servers normally:
   ```bash
   npm run dev
   ```

4. Access via your machine's IP address:
   - Web: http://YOUR_IP:3000
   - API: http://YOUR_IP:3001

## Environment Variables

### Required API Environment Variables
Create `apps/api/.env` with:

```env
# Database
DATABASE_URL="postgresql://benchiq:benchiq_dev_password@localhost:5432/benchiq_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Optional Web Environment Variables
Create `apps/web/.env.local` if needed:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

## Common Issues & Solutions

### Port Conflicts

If PostgreSQL port 5432 is already in use:

1. Edit `infra/docker-compose.yml`:
   ```yaml
   ports:
     - "5434:5432"  # Change to available port
   ```

2. Update `apps/api/.env`:
   ```env
   DATABASE_URL="postgresql://benchiq:benchiq_dev_password@localhost:5434/benchiq_dev?schema=public"
   ```
   
Note: Port 5434 is commonly used as an alternative if 5432 and 5433 are taken.

### TypeScript Errors in API

If you see TypeScript errors for missing type definitions, install the following:

```bash
cd apps/api
npm install --save-dev @types/node @types/passport @types/passport-jwt @types/passport-local @types/bcrypt @types/body-parser @types/cookie-parser @types/express @types/express-serve-static-core @types/qs @types/serve-static
cd ../..
```

Note: These errors don't prevent the server from running but should be fixed for production.

### Platform-Specific Issues (ARM64/M1 Macs)

If you encounter esbuild platform errors:

```bash
# Remove and reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

Ensure Docker containers are healthy:

```bash
docker ps | grep benchiq
# Should show "healthy" status

# Check logs if needed
docker logs benchiq-postgres
```

## Production Deployment

For production deployment:

1. Set secure environment variables
2. Use `npm run build` instead of `npm run dev`
3. Run migrations with `npm run db:migrate:deploy`
4. Consider using:
   - PM2 or systemd for process management
   - Nginx for reverse proxy
   - SSL certificates (Let's Encrypt)
   - Managed database (AWS RDS, DigitalOcean, etc.)

## Database Management

### Reset Database (Warning: Data Loss!)
```bash
cd apps/api
npx prisma migrate reset
```

### Create New Migration
```bash
cd apps/api
npx prisma migrate dev --name your_migration_name
```

### View Database
```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

## Default Demo Account

If you ran the seed script:
```
Email: owner@demorepairshop.com
Password: password123
```

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review error logs: `docker logs benchiq-postgres`
3. Ensure all prerequisites are installed
4. Try the complete reinstall process