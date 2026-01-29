import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

// Use DATABASE_URL from the environment for Prisma.
// This avoids hard-coding secrets in the source and works in:
// - dev: via `.env.local` and dotenv in scripts
// - prod: via OS-level environment variable on the target machine
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Please configure it in your environment before running FileVault.',
  )
}

const adapter = new PrismaPg({
  connectionString,
})

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
