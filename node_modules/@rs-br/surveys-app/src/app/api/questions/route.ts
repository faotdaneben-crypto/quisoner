import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      include: {
        answers: {
          where: { displayOrder: { gte: 0 } },
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      data: questions
    })
    
  } catch (error: any) {
    console.error('Get questions error:', error?.message || error)
    const message = process.env.NODE_ENV === 'development'
      ? 'Database belum terhubung. Silakan periksa konfigurasi DATABASE_URL.'
      : 'Terjadi kendala saat memuat kuesioner. Silakan coba lagi.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}