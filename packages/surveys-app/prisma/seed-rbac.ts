import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * Seed akun RBAC (aman & idempoten).
 * Hanya membuat akun jika username belum ada. TIDAK menghapus/mengubah data.
 *
 * Jalankan: node --import tsx ./prisma/seed-rbac.ts
 */
const prisma = new PrismaClient()

const ACCOUNTS = [
  { name: 'Direksi', username: 'direksi', email: 'direksi@baiturrahim.co.id', role: 'DIREKSI', unitCode: null },
  { name: 'Kepala Laboratorium', username: 'ka.lab', email: 'ka.lab@baiturrahim.co.id', role: 'KEPALA_UNIT', unitCode: 'laboratorium' },
  { name: 'Viewer', username: 'viewer', email: 'viewer@baiturrahim.co.id', role: 'VIEWER', unitCode: null },
]

// Password awal sama untuk semua akun seed — WAJIB diganti setelah login pertama.
const DEFAULT_PASSWORD = 'Ganti123!'

async function main() {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const acc of ACCOUNTS) {
    const existing = await prisma.user.findUnique({ where: { username: acc.username } })
    if (existing) {
      console.log(`⏭  ${acc.username} sudah ada (role: ${existing.role}) — dilewati.`)
      continue
    }

    let unitId: string | null = null
    if (acc.unitCode) {
      const unit = await prisma.service.findUnique({ where: { code: acc.unitCode } })
      if (!unit) {
        console.log(`⚠  Unit "${acc.unitCode}" tidak ditemukan — ${acc.username} dilewati.`)
        continue
      }
      unitId = unit.id
    }

    await prisma.user.create({
      data: {
        name: acc.name,
        username: acc.username,
        email: acc.email,
        passwordHash: hashed,
        role: acc.role as any,
        isActive: true,
        unitId,
      },
    })
    console.log(`✓  ${acc.username} dibuat (role: ${acc.role}, unit: ${acc.unitCode || '-'})`)
  }

  console.log('\nPassword awal semua akun seed:', DEFAULT_PASSWORD)
  console.log('Ganti password setelah login pertama.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
