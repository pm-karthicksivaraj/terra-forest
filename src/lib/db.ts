// Prisma client setup — uses Neon serverless driver (WebSocket) on Vercel,
// falls back to standard TCP Prisma for local dev.
//
// Why: Vercel runs Node 24, where Prisma's bundled native query engine has
// a connection-layer issue. The Neon serverless driver uses WebSockets
// instead of TCP+TLS, sidestepping the issue entirely.

import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const useNeonAdapter =
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.USE_NEON_ADAPTER === 'true'

  if (useNeonAdapter) {
    // On Vercel we can use the global WebSocket (Node 20+ ships it natively).
    // Fall back to `ws` package if running on an older runtime.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws

    const connectionString = process.env.DATABASE_URL!
    const adapter = new PrismaNeon({ connectionString })
    return new PrismaClient({ adapter, log: ['error', 'warn'] })
  }

  // Local dev — plain TCP Prisma
  return new PrismaClient({ log: ['query'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
