import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client singleton untuk Next.js / Vercel (serverless).
 *
 * Pola yang aman:
 * - Simpan instance di `globalThis` supaya tidak dibuat ulang setiap kali
 *   module di-reload pada dev hot-reload / setiap lambda cold-start.
 * - `PrismaClient` dibuat secara LAZY (baru di-instantiate saat pertama kali
 *   dipakai), bukan pada module scope. Ini mencegah Prisma mencoba koneksi /
 *   gagal saat BUILD TIME (`next build`), karena pada saat build tidak ada
 *   koneksi database yang perlu dibuka. Query hanya terjadi saat request.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolusi URL database.
 *
 * Production (Vercel + Neon): Neon integration meng-inject connection string
 * Prisma-ready sebagai `DATABASE_URL_POSTGRES_PRISMA_URL`. Prioritaskan itu.
 * Fallback ke `DATABASE_URL` untuk development lokal (yang memakai localhost).
 *
 * Jangan hardcode URL/credential — selalu dari environment variable.
 */
function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL_POSTGRES_PRISMA_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL (atau DATABASE_URL_POSTGRES_PRISMA_URL) belum diset.'
    )
  }
  return url
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
