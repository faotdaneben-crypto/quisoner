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

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
