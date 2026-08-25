import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type')
    const all = searchParams.get('all')
    
    if (type === 'payment') {
      const paymentTypes = await prisma.paymentType.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      })
      return NextResponse.json({ success: true, data: paymentTypes })
    }
    
    const where = all === 'true' ? {} : { isActive: true }
    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json({ success: true, data: services })
  } catch (error: any) {
    console.error('Get services error:', error?.message || error)
    return NextResponse.json({ error: 'Gagal mengambil layanan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name } = body
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama unit wajib diisi' }, { status: 400 })
    }
    
    const code = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const service = await prisma.service.create({
      data: { name: name.trim(), code, isActive: true }
    })
    
    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error: any) {
    console.error('Create service error:', error?.message || error)
    return NextResponse.json({ error: 'Gagal menambah unit' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, isActive } = body
    
    const service = await prisma.service.update({
      where: { id },
      data: { isActive }
    })
    
    return NextResponse.json({ success: true, data: service })
  } catch (error: any) {
    console.error('Update service error:', error?.message || error)
    return NextResponse.json({ error: 'Gagal mengupdate unit' }, { status: 500 })
  }
}