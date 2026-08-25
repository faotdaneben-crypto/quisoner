import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { unitLabel, paymentTypeLabel } from '@/lib/survey-stats'

const VALID_STATUSES = ['new', 'read', 'followed_up', 'resolved']

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'suggestions')
  if ('response' in gate) return gate.response

  try {
    const searchParams = req.nextUrl.searchParams

    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    // Status filter — hanya diterapkan jika nilai valid & bukan 'all'/kosong
    if (status && status !== 'all' && VALID_STATUSES.includes(status)) {
      where.status = status
    }

    // Rentang tanggal (berdasarkan tanggal survei responden)
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) {
      // Sertakan seluruh hari endDate
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.lte = end
    }
    if (Object.keys(dateFilter).length > 0) {
      where.respondent = { surveyDate: dateFilter }
    }

    const suggestions = await prisma.suggestion.findMany({
      where,
      include: {
        respondent: {
          select: {
            name: true,
            serviceType: true,
            paymentType: true,
            surveyDate: true,
            surveyTime: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = suggestions.map((s) => ({
      id: s.id,
      suggestion: s.suggestion,
      status: s.status,
      name: s.respondent?.name || 'Anonim',
      serviceType: unitLabel(s.respondent?.serviceType),
      serviceTypeRaw: s.respondent?.serviceType || '',
      paymentType: paymentTypeLabel(s.respondent?.paymentType),
      date: s.respondent?.surveyDate
        ? s.respondent.surveyDate.toISOString()
        : s.createdAt.toISOString(),
      time: s.respondent?.surveyTime || '',
      createdAt: s.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Get suggestions error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat saran & masukan.' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requirePermission(req, 'suggestions')
  if ('response' in gate) return gate.response

  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID saran tidak valid' },
        { status: 400 }
      )
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    const updated = await prisma.suggestion.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } })
  } catch (error: any) {
    console.error('Update suggestion error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status saran.' },
      { status: 500 }
    )
  }
}
