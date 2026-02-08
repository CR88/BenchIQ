import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: pg.Pool
}

function createPool() {
  const pool = new pg.Pool({
    connectionString: process.env.DIRECT_DATABASE_URL,
    max: 10,
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  })

  // Eagerly warm the pool so first request isn't slow
  pool.connect().then((client) => client.release()).catch(() => {})

  return pool
}

function createPrismaClient() {
  const pool = globalForPrisma.pool || createPool()
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
