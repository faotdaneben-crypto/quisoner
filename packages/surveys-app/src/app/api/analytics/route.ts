import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSurveyStatistics, getSatisfactionTrend } from '@/lib/survey-stats'
import { authenticateRequest } from '@/lib/auth'
import { hasPermission } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * Endpoint analytics bersama untuk dashboard Direksi / KEPALA_UNIT / VIEWER.
 * - Menerapkan scope unit untuk KEPALA_UNIT (server-side).
 * - Butuh permission 'analytics'.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasPermission(auth.role, 'analytics')) {
    return NextResponse.json({ error: 'Forbidden: akses ditolak' }, { status: 403 })
  }

  try {
    const sp = req.nextUrl.searchParams
    const filters = {
      startDate: sp.get('startDate') || undefined,
      endDate: sp.get('endDate') || undefined,
      serviceType: sp.get('serviceType') || undefined,
      paymentType: sp.get('paymentType') || undefined,
    }

    // Scope unit untuk KEPALA_UNIT: paksa serviceType ke unit miliknya.
    if (auth.role === 'KEPALA_UNIT') {
      if (!auth.unitId) {
        return NextResponse.json(
          { success: false, error: 'Akun Kepala Unit tidak memiliki unit yang ditetapkan' },
          { status: 403 }
        )
      }
      // unitId adalah id Service; kita perlu code-nya. Ambil dari DB.
      const unit = await prisma.service.findUnique({ where: { id: auth.unitId } })
      if (!unit) {
        return NextResponse.json(
          { success: false, error: 'Unit tidak ditemukan' },
          { status: 404 }
        )
      }
      filters.serviceType = unit.code
    }

    const stats = await getSurveyStatistics(filters)
    const trend = await getSatisfactionTrend(filters)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRespondents: stats.summary.totalRespondents,
          todayCount: stats.summary.todayCount,
          monthCount: stats.summary.monthCount,
          satisfactionPercentage: stats.summary.satisfactionPercentage,
          averageScore: stats.summary.averageScore,
          totalUnits: stats.summary.totalUnits,
          totalQuestions: stats.summary.totalQuestions,
        },
        unitStats: stats.unitStats,
        questionStats: stats.questionStats,
        paymentTypeStats: stats.paymentTypeStats,
        trend,
        // unit terbaik & perlu perhatian
        bestUnit: stats.unitStats[0] || null,
        worstUnit: stats.unitStats.length > 0 ? stats.unitStats[stats.unitStats.length - 1] : null,
      },
    })
  } catch (error: any) {
    console.error('Analytics error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data analitik' },
      { status: 500 }
    )
  }
}
