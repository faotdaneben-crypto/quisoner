import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { unitLabel, paymentTypeLabel } from '@/lib/survey-stats'

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'respondents')
  if ('response' in gate) return gate.response

  try {
    const searchParams = req.nextUrl.searchParams
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const serviceType = searchParams.get('serviceType')
    const gender = searchParams.get('gender')
    const education = searchParams.get('education')
    const search = searchParams.get('search')
    
    const where: any = {}
    
    if (startDate && endDate) {
      where.surveyDate = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    
    if (serviceType) where.serviceType = serviceType
    if (gender) where.gender = gender
    if (education) where.education = education
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { serviceType: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const [respondents, total] = await Promise.all([
      prisma.respondent.findMany({
        where,
        include: {
          responses: {
            select: { answerOption: { select: { score: true } } }
          },
          suggestions: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      
      prisma.respondent.count({ where })
    ])
    
    const respondentsWithStats = respondents.map((r: any) => {
      const totalScore = r.responses.reduce((sum: number, resp: any) => sum + resp.answerOption.score, 0)
      const maxPossible = r.responses.length * 4
      const satisfaction = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 10000) / 100 : 0

      return {
        id: r.id,
        surveyDate: r.surveyDate.toISOString().split('T')[0],
        surveyTime: r.surveyTime,
        name: r.name || 'Anonim',
        gender: r.gender,
        age: r.age,
        education: r.education,
        occupation: r.occupation,
        paymentType: paymentTypeLabel(r.paymentType),
        serviceType: unitLabel(r.serviceType),
        serviceTypeRaw: r.serviceType,
        totalScore,
        satisfaction,
        hasSuggestion: !!(r.suggestions && r.suggestions.length > 0),
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        respondents: respondentsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error: any) {
    console.error('Get respondents error:', error?.message || error)
    return NextResponse.json({ error: 'Gagal memuat data responden' }, { status: 500 })
  }
}