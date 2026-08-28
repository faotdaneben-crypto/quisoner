/**
 * Jalankan `prisma migrate deploy` + seed HANYA di production (saat koneksi
 * direct Neon tersedia via DATABASE_URL_UNPOOLED).
 *
 * Di development lokal, DATABASE_URL_UNPOOLED tidak diset, sehingga script ini
 * skip (tanpa error) supaya `npm run build` lokal tetap berjalan.
 *
 * - `prisma migrate deploy` NON-DESTRUCTIVE (hanya menerapkan migrasi yang
 *   belum diterapkan; tidak pernah drop/reset).
 * - Seed bersifat IDEMPOTENT (skip jika data sudah ada).
 */
const { execSync } = require('child_process')

const directUrl = process.env.DATABASE_URL_UNPOOLED

if (!directUrl) {
  console.log(
    '[migrate] DATABASE_URL_UNPOOLED tidak diset — skip migrate+seed (development lokal).'
  )
  process.exit(0)
}

function run(cmd) {
  console.log(`[migrate] Menjalankan: ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

try {
  run('npx prisma migrate deploy')
  run('node --import tsx ./prisma/seed.ts')
  console.log('[migrate] Selesai.')
} catch (err) {
  console.error('[migrate] Gagal:', err?.message || err)
  process.exit(1)
}
