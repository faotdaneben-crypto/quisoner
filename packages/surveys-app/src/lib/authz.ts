/**
 * ROLE-BASED ACCESS CONTROL — otoritas terpusat.
 *
 * Satu-satunya tempat yang mendefinisikan role, permission, dan aturan akses.
 * JANGAN mengecek `role === ...` secara berantakan di file lain; gunakan
 * `hasPermission()` / `canAccess()` dari sini.
 */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DIREKSI' | 'KEPALA_UNIT' | 'VIEWER'

export const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'DIREKSI', 'KEPALA_UNIT', 'VIEWER']

// ===== Permission atomik =====
export type Permission =
  | 'dashboard'
  | 'respondents'
  | 'surveys'
  | 'suggestions'
  | 'units'
  | 'questions'
  | 'reports'
  | 'analytics'
  | 'export'
  | 'qr-codes'
  | 'settings'
  | 'users'
  | 'unit-own' // hanya unit milik KEPALA_UNIT

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard', 'respondents', 'surveys', 'suggestions', 'units',
    'questions', 'reports', 'analytics', 'export', 'qr-codes',
    'settings', 'users',
  ],
  ADMIN: [
    'dashboard', 'respondents', 'surveys', 'suggestions', 'units',
    'questions', 'reports', 'analytics', 'export', 'qr-codes',
  ],
  DIREKSI: [
    'dashboard', 'reports', 'analytics', 'export',
  ],
  KEPALA_UNIT: [
    'dashboard', 'reports', 'analytics', 'suggestions', 'unit-own',
  ],
  VIEWER: [
    'dashboard', 'reports', 'analytics',
  ],
}

export function hasPermission(role: Role | string | undefined | null, permission: Permission): boolean {
  if (!role) return false
  // SUPER_ADMIN punya semua (termasuk permission yang belum terdaftar eksplisit).
  if (role === 'SUPER_ADMIN') return true
  const perms = ROLE_PERMISSIONS[role as Role]
  return !!perms?.includes(permission)
}

/** Route handler → permission minimal yang dibutuhkan. */
export function canAccess(role: Role | string | undefined | null, permission: Permission): boolean {
  return hasPermission(role, permission)
}

// ===== Label role untuk UI =====
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  DIREKSI: 'Direksi',
  KEPALA_UNIT: 'Kepala Unit',
  VIEWER: 'Viewer',
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as Role] || role
}

/** URL dashboard tujuan setelah login, berdasarkan role. */
export function dashboardPathForRole(role: Role | string | undefined | null): string {
  switch (role) {
    case 'DIREKSI':
      return '/direksi/dashboard'
    case 'KEPALA_UNIT':
      return '/unit/dashboard'
    case 'VIEWER':
      return '/viewer/dashboard'
    case 'ADMIN':
    case 'SUPER_ADMIN':
    default:
      return '/admin/dashboard'
  }
}

/** Apakah role boleh mengelola pengguna (hanya SUPER_ADMIN). */
export function canManageUsers(role: Role | string | undefined | null): boolean {
  return role === 'SUPER_ADMIN'
}

/** Apakah role dibatasi ke satu unit (hanya KEPALA_UNIT). */
export function isUnitScoped(role: Role | string | undefined | null): boolean {
  return role === 'KEPALA_UNIT'
}
