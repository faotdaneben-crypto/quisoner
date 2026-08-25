import { NextRequest, NextResponse } from 'next/server'
import { getSurveyStatistics } from '@/lib/survey-stats'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'dashboard')
  if ('response' in gate) return gate.response

  try {
    const searchParams = req.nextUrl.searchParams
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
    }

    const stats = await getSurveyStatistics(filters)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRespondents: stats.summary.totalRespondents,
          todayCount: stats.summary.todayCount,
          monthCount: stats.summary.monthCount,
          averageSatisfaction: stats.summary.satisfactionPercentage,
          averageScore: stats.summary.averageScore,
        },
        serviceRankings: stats.unitStats.map((u) => ({
          name: u.name,
          average: u.satisfaction,
          count: u.count,
        })),
        questionStats: stats.questionStats.map((q) => ({
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          average: q.percentage,
          count: q.count,
          distribution: [],
        })),
      },
    })
  } catch (error: any) {
    console.error('Dashboard summary error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat dashboard' },
      { status: 500 }
    )
  }
}
