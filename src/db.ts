import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

// Ensure we always have a valid connection string at runtime.
// Prefer DATABASE_URL from the environment, but fall back to the
// same value used in development for the packaged app.
const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL
})

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
