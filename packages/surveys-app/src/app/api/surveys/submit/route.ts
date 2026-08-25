import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = body as any
    const respondentId = `respondent_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Normalisasi saran: trim & anggap kosong sebagai tidak ada saran
    const suggestionText =
      typeof validatedData.suggestion === 'string'
        ? validatedData.suggestion.trim()
        : ''

    const result = await prisma.$transaction(async (tx) => {
      const createdRespondent = await tx.respondent.create({
        data: {
          id: respondentId,
          surveyDate: new Date(),
          surveyTime: validatedData.surveyTime || '',
          name: validatedData.name || null,
          gender: validatedData.gender,
          age: Number(validatedData.age),
          education: validatedData.education,
          occupation: validatedData.occupation,
          paymentType: validatedData.paymentType || null,
          paymentTypeOther: validatedData.paymentTypeOther || null,
          serviceType: validatedData.serviceType,
          unitOther: validatedData.unitOther || null,
          ipAddress: req.headers.get('x-forwarded-for') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      })

      await Promise.all(
        (validatedData.responses || []).map(async (r: any) => {
          const answerOption = await tx.answerOption.findUniqueOrThrow({
            where: { id: r.answerOptionId },
          })
          return tx.response.create({
            data: {
              id: `response_${Date.now()}_${Math.random().toString(36).substring(7)}_${r.questionId}`,
              respondentId: respondentId,
              questionId: r.questionId,
              answerOptionId: r.answerOptionId,
              score: answerOption.score,
            },
          })
        })
      )

      if (suggestionText) {
        await tx.suggestion.create({
          data: {
            id: `suggestion_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            respondentId: respondentId,
            suggestion: suggestionText,
            status: 'new',
          },
        })
      }

      return createdRespondent
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Terima kasih, kuesioner Anda berhasil dikirim.',
        respondent: {
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Survey submission error:', error?.message || error)
    const message =
      process.env.NODE_ENV === 'development'
        ? 'Database belum terhubung. Silakan periksa konfigurasi DATABASE_URL.'
        : 'Terjadi kesalahan saat mengirim kuesioner. Silakan coba lagi.'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
