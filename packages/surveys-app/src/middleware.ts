import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proteksi sisi server untuk API.
 *
 * CATATAN PENTING: proteksi utama dilakukan DI SETIAP route handler melalui
 * `requirePermission()` / `requireSuperAdmin()` (lib/auth.ts) — ini yang
 * menjamin role benar-benar tervalidasi di server, bukan hanya UI.
 *
 * Middleware ini sebagai lapisan tambahan: menolak request API sensitif yang
 * tidak membawa Authorization header Bearer sama sekali.
 */

// Endpoint publik (tanpa auth): login & submit survey pasien.
const PUBLIC_APIS = ['/api/auth/login', '/api/surveys/submit', '/api/questions', '/api/services']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api/')) {
    if (PUBLIC_APIS.some((p) => pathname === p || pathname.startsWith(p + '?'))) {
      return NextResponse.next()
    }
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
