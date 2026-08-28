/**
 * Jalankan `prisma migrate deploy` HANYA di production (saat koneksi direct
 * Neon tersedia via DATABASE_URL_UNPOOLED).
 *
 * Di development lokal, DATABASE_URL_UNPOOLED tidak diset, sehingga script ini
 * skip (tanpa error) supaya `npm run build` lokal tetap berjalan.
 *
 * Migrasi bersifat NON-DESTRUCTIVE (prisma migrate deploy hanya menerapkan
 * migrasi yang belum diterapkan; tidak pernah drop/reset).
 */
const { execSync } = require('child_process')

const directUrl = process.env.DATABASE_URL_UNPOOLED

if (!directUrl) {
  console.log(
    '[migrate] DATABASE_URL_UNPOOLED tidak diset — skip migrate deploy (development lokal).'
  )
  process.exit(0)
}

try {
  console.log('[migrate] Menjalankan prisma migrate deploy (production/Neon)...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('[migrate] Selesai.')
} catch (err) {
  console.error('[migrate] Gagal:', err?.message || err)
  process.exit(1)
}
