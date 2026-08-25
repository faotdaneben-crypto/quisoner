import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth'
import { ROLES } from '@/lib/authz'

export const dynamic = 'force-dynamic'

// GET /api/users — daftar semua user (hanya SUPER_ADMIN)
export async function GET(req: NextRequest) {
  const gate = await requireSuperAdmin(req)
  if ('response' in gate) return gate.response

  try {
    const users = await prisma.user.findMany({
      include: { unit: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      unitId: u.unitId,
      unitName: u.unit?.name || null,
      createdAt: u.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('List users error:', error?.message || error)
    return NextResponse.json({ success: false, error: 'Gagal memuat pengguna' }, { status: 500 })
  }
}

// POST /api/users — tambah user (hanya SUPER_ADMIN)
export async function POST(req: NextRequest) {
  const gate = await requireSuperAdmin(req)
  if ('response' in gate) return gate.response

  try {
    const body = await req.json()
    const { name, username, email, password, role, unitId } = body

    if (!name?.trim() || !username?.trim() || !password) {
      return NextResponse.json({ success: false, error: 'Nama, username, dan password wajib diisi' }, { status: 400 })
    }
    if (!ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Role tidak valid' }, { status: 400 })
    }
    if (role === 'KEPALA_UNIT' && !unitId) {
      return NextResponse.json({ success: false, error: 'Kepala Unit wajib memiliki unit' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        email: email?.trim() || `${username.trim()}@baiturrahim.co.id`,
        passwordHash,
        role,
        isActive: true,
        unitId: role === 'KEPALA_UNIT' ? unitId : null,
      },
      include: { unit: { select: { id: true, name: true } } },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          unitId: user.unitId,
          unitName: user.unit?.name || null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create user error:', error?.message || error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Username atau email sudah digunakan' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Gagal menambah pengguna' }, { status: 500 })
  }
}

// PATCH /api/users — update role/unit/status/password (hanya SUPER_ADMIN)
export async function PATCH(req: NextRequest) {
  const gate = await requireSuperAdmin(req)
  if ('response' in gate) return gate.response

  try {
    const body = await req.json()
    const { id, name, role, unitId, isActive, password } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengguna wajib diisi' }, { status: 400 })
    }

    const data: any = {}
    if (name?.trim()) data.name = name.trim()
    if (role) {
      if (!ROLES.includes(role)) {
        return NextResponse.json({ success: false, error: 'Role tidak valid' }, { status: 400 })
      }
      data.role = role
      // unit hanya untuk KEPALA_UNIT
      if (role === 'KEPALA_UNIT') {
        if (!unitId) return NextResponse.json({ success: false, error: 'Kepala Unit wajib memiliki unit' }, { status: 400 })
        data.unitId = unitId
      } else {
        data.unitId = null
      }
    } else if (unitId !== undefined) {
      data.unitId = unitId
    }
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (password) data.passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { unit: { select: { id: true, name: true } } },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        unitId: user.unitId,
        unitName: user.unit?.name || null,
      },
    })
  } catch (error: any) {
    console.error('Update user error:', error?.message || error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui pengguna' }, { status: 500 })
  }
}
