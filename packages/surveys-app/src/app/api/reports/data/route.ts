import { NextRequest, NextResponse } from 'next/server'
import { getSurveyStatistics } from '@/lib/survey-stats'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'reports')
  if ('response' in gate) return gate.response

  try {
    const searchParams = req.nextUrl.searchParams
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      paymentType: searchParams.get('paymentType') || undefined,
    }

    const stats = await getSurveyStatistics(filters)

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
      },
    })
  } catch (error: any) {
    console.error('Report data error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data laporan' },
      { status: 500 }
    )
  }
}
