import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import type { Role, Permission } from '@/lib/authz'
import { hasPermission } from '@/lib/authz'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export interface JwtPayload {
  userId: string
  username: string
  role: Role
  unitId?: string | null
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

export async function authenticateRequest(req: NextRequest): Promise<JwtPayload | null> {
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

/**
 * Middleware helper — tolak request jika tidak punya permission.
 * Return null bila lolos, atau NextResponse (401/403) bila ditolak.
 */
export async function requirePermission(
  req: NextRequest,
  permission: Permission
): Promise<{ auth: JwtPayload } | { response: NextResponse }> {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!hasPermission(auth.role, permission)) {
    return { response: NextResponse.json({ error: 'Forbidden: akses ditolak' }, { status: 403 }) }
  }
  return { auth }
}

/** Super admin only gate (untuk manajemen pengguna). */
export async function requireSuperAdmin(
  req: NextRequest
): Promise<{ auth: JwtPayload } | { response: NextResponse }> {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (auth.role !== 'SUPER_ADMIN') {
    return { response: NextResponse.json({ error: 'Forbidden: hanya Super Admin' }, { status: 403 }) }
  }
  return { auth }
}
