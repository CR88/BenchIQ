# BenchIQ

Repair shop management system built with Next.js 16, Prisma 7, Auth.js v5, and shadcn/ui.

## First-time setup

### Prerequisites
- Node.js 20+
- PostgreSQL running on localhost:5432 (Docker recommended)
- `npm install` completed

### Database setup

1. Create the database:
```bash
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE benchiq;"
```

2. Set up your `.env` file:
```
DIRECT_DATABASE_URL="postgres://postgres:postgres@localhost:5432/benchiq"
AUTH_SECRET="benchiq-dev-secret-change-in-production"
AUTH_URL="http://localhost:3000"
```

3. Generate the Prisma client, push schema, and seed:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

**Important:** After running `npx prisma generate`, you must recreate the barrel file at `src/generated/prisma/index.ts`. Prisma 7 does not generate this file. See the "Prisma 7 gotchas" section below.

4. Start the dev server:
```bash
npm run dev
```

5. Login with: `admin@demorepairs.com` / `password123`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:seed` | Seed demo data (destructive - wipes existing) |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run tests (vitest) |
| `npx tsc --noEmit` | Type check |

## Architecture

### Stack
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Database:** PostgreSQL via Prisma 7.3.0 with `@prisma/adapter-pg`
- **Auth:** Auth.js v5 beta (next-auth@5.0.0-beta.30) with JWT strategy
- **UI:** shadcn/ui, Tailwind CSS, Radix primitives
- **State:** Zustand (POS cart), @dnd-kit (kanban)
- **Charts:** recharts

### Key directories
```
src/
  app/(auth)/          # Login, register pages
  app/(dashboard)/     # All authenticated pages
  app/api/             # Auth API routes
  components/          # UI and feature components
  lib/
    actions/           # Server actions (mutations)
    queries/           # Data fetching functions
    validators/        # Zod schemas
  generated/prisma/    # Prisma generated client
  proxy.ts             # Auth proxy (replaces middleware.ts in Next.js 16)
```

### Auth pattern (Edge Runtime split)
Auth is split into two files to support the proxy (edge-compatible):
- `src/lib/auth.config.ts` -- Edge-safe config (no DB imports), used by `proxy.ts`
- `src/lib/auth.ts` -- Full config with PrismaAdapter, used by server actions/pages

### Database connection
Uses `@prisma/adapter-pg` with a `pg.Pool` for direct TCP connection to PostgreSQL. Do NOT use `prisma dev` -- it proxies through a slow Node.js process. Connect directly to a real PostgreSQL instance.

## Prisma 7 gotchas

### No barrel file generated
`npx prisma generate` does NOT create `src/generated/prisma/index.ts`. This barrel file must exist and must be browser-safe (no PrismaClient value export). It should only export:
- Enums as values (from `./enums`)
- Model types as type-only (from `./client`)

For PrismaClient, import directly: `import { PrismaClient } from "@/generated/prisma/client"`

### Decimal serialization
Prisma Decimal fields are not serializable across the React Server Component boundary. When passing data from server components to client components, map objects to plain types first:
```ts
products.map(p => ({ ...p, retailPrice: Number(p.retailPrice) }))
```

### Zod + react-hook-form
- `z.boolean().default()` and `z.coerce.number()` cause resolver type mismatches
- Fix: remove `.default()` from schemas, set defaults in `useForm({ defaultValues })`
- For `z.coerce`, cast resolver: `zodResolver(schema) as any`
