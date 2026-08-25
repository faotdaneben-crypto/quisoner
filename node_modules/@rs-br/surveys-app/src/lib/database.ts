import { prisma } from '@/lib/prisma'

export async function createRespondent(data: any) {
  const respondent = await prisma.respondent.create({
    data,
    include: { responses: { include: { question: true, answerOption: true } } }
  })
  
  if (data.suggestion) {
    await prisma.suggestion.create({
      data: {
        respondentId: respondent.id,
        suggestion: data.suggestion
      }
    })
  }
  
  return respondent
}

export async function getQuestions() {
  return await prisma.question.findMany({
    where: { isActive: true },
    include: {
      answers: {
        where: { displayOrder: { gte: 0 } },
        orderBy: { displayOrder: 'asc' }
      }
    },
    orderBy: { displayOrder: 'asc' }
  })
}

export async function getRespondentById(id: string) {
  return await prisma.respondent.findUnique({
    where: { id },
    include: {
      responses: {
        include: {
          question: true,
          answerOption: true
        }
      },
      suggestions: true
    }
  })
}

export async function getAllRespondents(filters?: {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  gender?: string;
  education?: string;
  skip?: number;
  take?: number;
}) {
  const where: any = {}
  
  if (filters?.startDate && filters?.endDate) {
    where.surveyDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate)
    }
  }
  
  if (filters?.serviceType) {
    where.serviceType = filters.serviceType
  }
  
  if (filters?.gender) {
    where.gender = filters.gender
  }
  
  if (filters?.education) {
    where.education = filters.education
  }
  
  return await prisma.respondent.findMany({
    where,
    include: {
      responses: {
        include: {
          question: true,
          answerOption: true
        }
      },
      suggestions: true
    },
    orderBy: { createdAt: 'desc' },
    skip: filters?.skip || 0,
    take: filters?.take || 50
  })
}

export async function getTotalRespondentsCount() {
  return await prisma.respondent.count()
}

export async function getTodayCount() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return await prisma.respondent.count({
    where: {
      surveyDate: {
        gte: today
      }
    }
  })
}

export async function getMonthCount() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return await prisma.respondent.count({
    where: {
      surveyDate: {
        gte: firstDay
      }
    }
  })
}

export async function getAverageScore() {
  const result = await prisma.response.groupBy({
    by: ['respondentId'],
    _avg: { score: true },
    _sum: { score: true }
  })
  
  if (result.length === 0) return 0
  
  const avgScores = result.map((r: any) => r._avg.score!)
  const totalAvg = avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length
  
  return Math.round(totalAvg * 100) / 100
}

export async function getServiceRankings(startDate?: string, endDate?: string) {
  const where: any = {}
  
  if (startDate && endDate) {
    where.surveyDate = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }
  
  const respondents = await prisma.respondent.findMany({
    where,
    select: {
      id: true,
      serviceType: true,
      responses: {
        select: { score: true }
      }
    }
  })
  
  const serviceStats: Record<string, {total: number, count: number, scores: number[]}> = {}
  
  for (const resp of respondents) {
    const service = resp.serviceType
    const totalScore = resp.responses.reduce((sum: number, r: any) => sum + r.score, 0)
    const maxPossible = resp.responses.length * 4
    
    if (!serviceStats[service]) {
      serviceStats[service] = { total: 0, count: 0, scores: [] }
    }
    
    serviceStats[service].total += (totalScore / maxPossible) * 100
    serviceStats[service].count += 1
    serviceStats[service].scores.push((totalScore / maxPossible) * 100)
  }
  
  return Object.entries(serviceStats)
    .map(([name, stats]) => ({
      name,
      average: Math.round((stats.total / stats.count) * 100) / 100,
      count: stats.count
    }))
    .sort((a, b) => b.average - a.average)
}

export async function getTopImprovements(startDate?: string, endDate?: string) {
  const where: any = {}
  
  if (startDate && endDate) {
    where.surveyDate = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }
  
  const questions = await prisma.question.findMany({
    where: { isActive: true },
    include: {
      responses: {
        where: {
          respondent: { surveyDate: { gte: where.surveyDate?.gte ?? new Date(0) } }
        },
        include: { answerOption: true }
      }
    }
  })
  
  return questions
    .map((q: any) => {
      const total = q.responses.reduce((sum: number, r: any) => sum + r.score, 0)
      const max = q.responses.length * 4
      const percentage = max > 0 ? (total / max) * 100 : 0
      
      return {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        average: Math.round(percentage * 100) / 100,
        count: q.responses.length
      }
    })
    .sort((a: any, b: any) => a.average - b.average)
    .slice(0, 3)
}