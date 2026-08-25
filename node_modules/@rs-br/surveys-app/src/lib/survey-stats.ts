import { prisma } from '@/lib/prisma'

/**
 * SINGLE SOURCE OF TRUTH untuk seluruh statistik survei.
 *
 * Semua halaman (Dashboard, Report web, Excel, PDF, Unit, Saran) HARUS
 * memanggil fungsi-fungsi di sini. JANGAN menulis ulang logika perhitungan
 * kepuasan di route/halaman lain, supaya angkanya selalu identik.
 */

// ===== Normalisasi unit layanan =====
// Database mencampur casing slug (rawat-inap, igd) dan UPPERCASE (LABORATORIUM).
// Normalisasi ke slug kanonik yang sama dengan tabel `services`.
const UNIT_ALIASES: Record<string, string> = {
  pen_daftaran: 'pendaftaran',
  pendaftaran: 'pendaftaran',
  igd: 'igd',
  'rawat-jalan': 'rawat-jalan',
  rawat_jalan: 'rawat-jalan',
  'rawat-inap': 'rawat-inap',
  rawat_inap: 'rawat-inap',
  farmasi: 'farmasi',
  laboratorium: 'laboratorium',
  radiologi: 'radiologi',
  mcu: 'mcu',
  administrasi: 'administrasi',
  lainnya: 'lainnya',
  // unit tambahan sesuai daftar service di DB
  fisioterapi: 'fisioterapi',
  poli: 'poli',
  'kamar-bersalin': 'kamar-bersalin',
  poliklinik: 'poliklinik',
  hemodialisa: 'hemodialisa',
  icu: 'icu',
  'kamar-operasi': 'kamar-operasi',
  registrasi: 'registrasi',
}

export function normalizeUnitCode(code: string | null | undefined): string {
  if (!code) return 'lainnya'
  const key = code.trim().toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-')
  return UNIT_ALIASES[key] || key
}

// Label manusia untuk unit (slug -> label). Fallback: slug apa adanya.
export function unitLabel(code: string | null | undefined): string {
  const slug = normalizeUnitCode(code)
  const labels: Record<string, string> = {
    pendaftaran: 'Pendaftaran',
    igd: 'IGD',
    'rawat-jalan': 'Rawat Jalan',
    'rawat-inap': 'Rawat Inap',
    farmasi: 'Farmasi',
    laboratorium: 'Laboratorium',
    radiologi: 'Radiologi',
    mcu: 'Medical Check Up',
    administrasi: 'Administrasi',
    lainnya: 'Lainnya',
    fisioterapi: 'Fisioterapi',
    poli: 'Poli',
    'kamar-bersalin': 'Kamar Bersalin',
    poliklinik: 'Poliklinik',
    hemodialisa: 'Hemodialisa',
    icu: 'ICU',
    'kamar-operasi': 'Kamar Operasi',
    registrasi: 'Registrasi',
  }
  return labels[slug] || slug
}

// Label jenis layanan (payment type)
export function paymentTypeLabel(code: string | null | undefined): string {
  const labels: Record<string, string> = {
    ktp_umum: 'KTP (Umum)',
    bpjs: 'BPJS',
    kartu_asuransi: 'Kartu Asuransi',
    lainnya: 'Lainnya',
  }
  if (!code) return ''
  return labels[code.toLowerCase()] || code
}

// ===== Util rounding konsisten =====
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export interface SurveyFilters {
  startDate?: string
  endDate?: string
  serviceType?: string // unit slug atau kode apa pun (dinormalisasi)
  paymentType?: string
}

export interface KpiSummary {
  totalRespondents: number
  todayCount: number
  monthCount: number
  satisfactionPercentage: number // rata-rata persen per responden (0-100)
  averageScore: number // skor rata-rata 0-4
  totalUnits: number
  totalQuestions: number
}

export interface UnitStat {
  code: string // slug kanonik
  name: string // label manusia
  count: number
  satisfaction: number // rata-rata persen (0-100)
  totalScore: number
  maxScore: number
  averageScore: number // skor rata-rata 0-4
}

export interface QuestionStat {
  questionNumber: number
  questionText: string
  count: number
  average: number // skor rata-rata 0-4
  percentage: number // 0-100
  totalScore: number
  maxScore: number
}

export interface PaymentTypeStat {
  code: string
  name: string
  count: number
  percentage: number // 0-100
}

export interface SurveyStatistics {
  summary: KpiSummary
  unitStats: UnitStat[]
  questionStats: QuestionStat[]
  paymentTypeStats: PaymentTypeStat[]
}

function buildWhere(filters: SurveyFilters): any {
  const where: any = {}

  if (filters.startDate && filters.endDate) {
    // endDate inklusif sampai akhir hari (timezone Asia/Jakarta aman karena
    // surveyDate disimpan UTC dan kita set batas akhir jam lokal).
    const start = new Date(`${filters.startDate}T00:00:00.000`)
    const end = new Date(`${filters.endDate}T23:59:59.999`)
    where.surveyDate = { gte: start, lte: end }
  }

  if (filters.serviceType && filters.serviceType !== 'all') {
    // Normalisasi: cocokkan baik slug maupun kode UPPERCASE lama.
    const slug = normalizeUnitCode(filters.serviceType)
    // Karena data lama bercampur, cari dengan beberapa kemungkinan nilai.
    where.serviceType = { in: unitCodeCandidates(slug), mode: 'insensitive' as const }
  }

  if (filters.paymentType && filters.paymentType !== 'all') {
    where.paymentType = { equals: filters.paymentType, mode: 'insensitive' as const }
  }

  return where
}

// Kandidat nilai serviceType di DB untuk sebuah slug kanonik.
function unitCodeCandidates(slug: string): string[] {
  const up = slug.toUpperCase()
  const candidates = [slug, up]
  // map slug -> kemungkinan kode uppercase lama
  const legacy: Record<string, string> = {
    pendaftaran: 'PENDAFTARAN',
    igd: 'IGD',
    'rawat-jalan': 'RAWAT_JALAN',
    'rawat-inap': 'RAWAT_INAP',
    farmasi: 'FARMASI',
    laboratorium: 'LABORATORIUM',
    radiologi: 'RADIOLOGI',
    mcu: 'MCU',
    administrasi: 'ADMINISTRASI',
    lainnya: 'LAINNYA',
  }
  if (legacy[slug]) candidates.push(legacy[slug])
  return Array.from(new Set(candidates))
}

export async function getSurveyStatistics(filters: SurveyFilters = {}): Promise<SurveyStatistics> {
  const where = buildWhere(filters)

  const respondents = await prisma.respondent.findMany({
    where,
    include: {
      responses: { select: { score: true, questionId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const questions = await prisma.question.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  })

  // ===== KPI dasar =====
  const totalRespondents = respondents.length

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayCount = respondents.filter((r) => new Date(r.surveyDate) >= todayStart).length
  const monthCount = respondents.filter((r) => new Date(r.surveyDate) >= monthStart).length

  // ===== Skor & kepuasan =====
  let totalScore = 0
  let totalMax = 0
  const perRespondentPcts: number[] = []

  const unitAcc: Record<string, { count: number; pcts: number[]; totalScore: number; maxScore: number }> = {}
  const paymentAcc: Record<string, number> = {}
  const questionAcc: Record<string, { score: number; count: number }> = {}

  for (const r of respondents) {
    const respScore = r.responses.reduce((s, x) => s + x.score, 0)
    const respMax = r.responses.length * 4
    if (respMax > 0) {
      totalScore += respScore
      totalMax += respMax
      const pct = (respScore / respMax) * 100
      perRespondentPcts.push(pct)

      const unit = normalizeUnitCode(r.serviceType)
      if (!unitAcc[unit]) unitAcc[unit] = { count: 0, pcts: [], totalScore: 0, maxScore: 0 }
      unitAcc[unit].count++
      unitAcc[unit].pcts.push(pct)
      unitAcc[unit].totalScore += respScore
      unitAcc[unit].maxScore += respMax
    }

    const pt = (r.paymentType || '').toLowerCase()
    if (pt) paymentAcc[pt] = (paymentAcc[pt] || 0) + 1

    for (const resp of r.responses) {
      if (!questionAcc[resp.questionId]) questionAcc[resp.questionId] = { score: 0, count: 0 }
      questionAcc[resp.questionId].score += resp.score
      questionAcc[resp.questionId].count++
    }
  }

  const satisfactionPercentage = perRespondentPcts.length > 0
    ? round2(perRespondentPcts.reduce((a, b) => a + b, 0) / perRespondentPcts.length)
    : 0

  const averageScore = totalMax > 0 ? round2((totalScore / totalMax) * 4) : 0

  // ===== Unit stats =====
  const unitStats: UnitStat[] = Object.entries(unitAcc)
    .map(([code, v]) => ({
      code,
      name: unitLabel(code),
      count: v.count,
      satisfaction: round2(v.pcts.reduce((a, b) => a + b, 0) / v.pcts.length),
      totalScore: v.totalScore,
      maxScore: v.maxScore,
      averageScore: v.maxScore > 0 ? round2((v.totalScore / v.maxScore) * 4) : 0,
    }))
    .sort((a, b) => b.satisfaction - a.satisfaction)

  // ===== Question stats =====
  const questionStats: QuestionStat[] = questions.map((q) => {
    const acc = questionAcc[q.id] || { score: 0, count: 0 }
    const average = acc.count > 0 ? round2(acc.score / acc.count) : 0
    const percentage = acc.count > 0 ? round2((acc.score / (acc.count * 4)) * 100) : 0
    return {
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      count: acc.count,
      average,
      percentage,
      totalScore: acc.score,
      maxScore: acc.count * 4,
    }
  })

  // ===== Payment type stats =====
  const totalWithPayment = Object.values(paymentAcc).reduce((a, b) => a + b, 0)
  const paymentTypeStats: PaymentTypeStat[] = Object.entries(paymentAcc)
    .map(([code, count]) => ({
      code,
      name: paymentTypeLabel(code),
      count,
      percentage: totalWithPayment > 0 ? round2((count / totalWithPayment) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    summary: {
      totalRespondents,
      todayCount,
      monthCount,
      satisfactionPercentage,
      averageScore,
      totalUnits: unitStats.length,
      totalQuestions: questions.length,
    },
    unitStats,
    questionStats,
    paymentTypeStats,
  }
}

/** Data responden (untuk laporan detail) — pakai include response lengkap. */
export async function getRespondentsForExport(filters: SurveyFilters = {}) {
  const where = buildWhere(filters)
  return prisma.respondent.findMany({
    where,
    include: {
      responses: { include: { question: true, answerOption: true } },
      suggestions: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export interface TrendPoint {
  label: string // e.g. "Agu"
  month: string // e.g. "2026-08"
  count: number
  satisfaction: number // 0-100
}

/**
 * Tren kepuasan per bulan (untuk dashboard direksi/analytics).
 * Mengembalikan 12 bulan terakhir (atau semua bulan yang ada datanya).
 */
export async function getSatisfactionTrend(filters: SurveyFilters = {}): Promise<TrendPoint[]> {
  const where = buildWhere(filters)
  const respondents = await prisma.respondent.findMany({
    where,
    select: { surveyDate: true, responses: { select: { score: true } } },
  })

  // Kelompokkan per bulan (format YYYY-MM)
  const byMonth: Record<string, { count: number; pcts: number[] }> = {}
  for (const r of respondents) {
    const d = new Date(r.surveyDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[key]) byMonth[key] = { count: 0, pcts: [] }
    byMonth[key].count++
    const score = r.responses.reduce((s, x) => s + x.score, 0)
    const max = r.responses.length * 4
    if (max > 0) byMonth[key].pcts.push((score / max) * 100)
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return Object.entries(byMonth)
    .map(([month, v]) => {
      const [y, m] = month.split('-').map(Number)
      return {
        label: `${MONTHS[m - 1]}`,
        month,
        count: v.count,
        satisfaction: v.pcts.length > 0 ? round2(v.pcts.reduce((a, b) => a + b, 0) / v.pcts.length) : 0,
      }
    })
    .sort((a, b) => (a.month < b.month ? -1 : 1))
}
