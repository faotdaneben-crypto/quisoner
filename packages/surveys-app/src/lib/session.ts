'use client'

import type { Role } from '@/lib/authz'

export interface AuthUser {
  id: string
  name: string
  username: string
  role: Role
  unitId?: string | null
  unitName?: string | null
  redirectTo?: string
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('adminUser')
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('adminToken')
}

export function clearSession() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
}
