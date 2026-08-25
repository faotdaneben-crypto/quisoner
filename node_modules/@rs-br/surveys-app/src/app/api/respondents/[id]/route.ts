import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { unitLabel, paymentTypeLabel } from '@/lib/survey-stats'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission(req, 'respondents')
  if ('response' in gate) return gate.response

  try {
    const { id } = await params

    const respondent = await prisma.respondent.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            question: { select: { questionNumber: true, questionText: true } },
            answerOption: { select: { optionText: true, score: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        suggestions: true,
      },
    })

    if (!respondent) {
      return NextResponse.json({ success: false, error: 'Responden tidak ditemukan' }, { status: 404 })
    }

    const totalScore = respondent.responses.reduce((s, r) => s + r.answerOption.score, 0)
    const maxScore = respondent.responses.length * 4
    const satisfaction = maxScore > 0 ? Math.round((totalScore / maxScore) * 10000) / 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        id: respondent.id,
        surveyDate: respondent.surveyDate.toISOString(),
        surveyTime: respondent.surveyTime,
        name: respondent.name || 'Anonim',
        gender: respondent.gender,
        age: respondent.age,
        education: respondent.education,
        occupation: respondent.occupation,
        paymentType: paymentTypeLabel(respondent.paymentType),
        paymentTypeRaw: respondent.paymentType,
        serviceType: unitLabel(respondent.serviceType),
        serviceTypeRaw: respondent.serviceType,
        unitOther: respondent.unitOther,
        _totalScore: totalScore,
        _maxScore: maxScore,
        _satisfaction: satisfaction,
        responses: respondent.responses.map((r) => ({
          question: {
            questionNumber: r.question.questionNumber,
            questionText: r.question.questionText,
          },
          answerOption: {
            optionText: r.answerOption.optionText,
            score: r.answerOption.score,
          },
        })),
        suggestion: respondent.suggestions
          ? {
              suggestion: respondent.suggestions.suggestion,
              status: respondent.suggestions.status,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error('Get respondent detail error:', error?.message || error)
    return NextResponse.json({ success: false, error: 'Gagal memuat detail responden' }, { status: 500 })
  }
}
