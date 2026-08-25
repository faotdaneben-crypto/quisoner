import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { dashboardPathForRole } from '@/lib/authz'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { username },
      include: { unit: { select: { id: true, name: true, code: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      unitId: user.unitId,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        unitId: user.unitId,
        unitName: user.unit?.name || null,
        redirectTo: dashboardPathForRole(user.role),
      },
    })
  } catch (error: any) {
    console.error('Login error:', error?.message || error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
