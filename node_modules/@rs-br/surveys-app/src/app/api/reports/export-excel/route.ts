import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as ExcelJS from 'exceljs'
import { getSurveyStatistics, getRespondentsForExport, unitLabel, paymentTypeLabel } from '@/lib/survey-stats'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Helper: format date to Indonesian locale
function formatDateID(date: Date): string {
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateFile(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function getSatisfactionStatus(pct: number): string {
  if (pct >= 80) return 'Sangat Puas'
  if (pct >= 70) return 'Puas'
  if (pct >= 60) return 'Cukup'
  return 'Kurang Puas'
}

function getQuestionStatus(pct: number): string {
  if (pct >= 80) return 'Sangat Baik'
  if (pct >= 70) return 'Baik'
  if (pct >= 60) return 'Cukup'
  return 'Perlu Perbaikan'
}

// Color palette
const BLUE_DARK = '084298'
const BLUE_RS = '0B5ED7'
const BLUE_LIGHT = 'EAF3FF'
const WHITE = 'FFFFFF'
const GRAY_LIGHT = 'F5F9FF'
const GRAY_MEDIUM = 'DCE6F2'
const TEXT_DARK = '172033'
const GREEN = '16A34A'
const RED = 'DC2626'
const YELLOW = 'F59E0B'

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'export')
  if ('response' in gate) return gate.response

  try {
    const searchParams = req.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const serviceType = searchParams.get('serviceType') || ''

    const filters = {
      startDate: startDateStr || undefined,
      endDate: endDateStr || undefined,
      serviceType: serviceType || undefined,
    }

    // SINGLE SOURCE OF TRUTH — statistik & data dari shared service.
    const stats = await getSurveyStatistics(filters)
    const respondents = await getRespondentsForExport(filters)
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    // --- KPIs (identik dengan dashboard/report/pdf) ---
    const totalRespondents = stats.summary.totalRespondents
    const todayCount = stats.summary.todayCount
    const monthCount = stats.summary.monthCount
    const averageSatisfaction = stats.summary.satisfactionPercentage
    const avgScore = stats.summary.averageScore
    const totalQuestions = stats.summary.totalQuestions

    // Unit rankings dari shared service
    const unitRankings = stats.unitStats.map((u) => ({
      name: u.name,
      code: u.code,
      count: u.count,
      avgPct: u.satisfaction,
      totalScore: u.totalScore,
      maxScore: u.maxScore,
      avgScore: u.averageScore,
      status: getSatisfactionStatus(u.satisfaction),
    }))
    const bestUnit = unitRankings[0]
    const worstUnit = unitRankings[unitRankings.length - 1]

    // Question stats dari shared service
    const questionStats = stats.questionStats.map((q) => ({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      count: q.count,
      totalScore: q.totalScore,
      maxScore: q.maxScore,
      avgScore: q.average,
      pct: q.percentage,
      status: getQuestionStatus(q.percentage),
    }))

    // Satisfaction distribution (dihitung dari data responden aktual)
    const perRespondentPcts = respondents
      .map((r) => {
        const respScore = r.responses.reduce((sum, x) => sum + x.score, 0)
        const respMax = r.responses.length * 4
        return respMax > 0 ? (respScore / respMax) * 100 : 0
      })
      .filter((p) => p > 0)
    const distSangatPuas = perRespondentPcts.filter((p) => p >= 80).length
    const distPuas = perRespondentPcts.filter((p) => p >= 70 && p < 80).length
    const distCukup = perRespondentPcts.filter((p) => p >= 60 && p < 70).length
    const distKurangPuas = perRespondentPcts.filter((p) => p < 60).length

    // --- BUILD WORKBOOK ---
    const wb = new ExcelJS.Workbook()
    wb.creator = 'RS Baiturrahim Jambi'
    wb.created = new Date()

    // ==================== SHEET 1: Ringkasan ====================
    const ws1 = wb.addWorksheet('Ringkasan', {
      properties: { tabColor: { argb: BLUE_RS } },
      pageSetup: { orientation: 'landscape', fitToPage: true }
    })

    // Column widths
    ws1.columns = [
      { width: 5 }, { width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
    ]

    // --- HEADER ---
    const titleRow = ws1.addRow([])
    ws1.mergeCells('B2:F2')
    const titleCell = ws1.getCell('B2')
    titleCell.value = 'RS BAITURRAHIM JAMBI'
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: WHITE } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_DARK } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(2).height = 40

    const subtitleRow = ws1.addRow([])
    ws1.mergeCells('B3:F3')
    const subtitleCell = ws1.getCell('B3')
    subtitleCell.value = 'LAPORAN KEPUASAN PASIEN'
    subtitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: WHITE } }
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_RS } }
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(3).height = 32

    // Period
    const periodText = startDateStr && endDateStr
      ? `Periode: ${formatDateID(new Date(startDateStr))} - ${formatDateID(new Date(endDateStr))}`
      : `Periode: Semua Data`
    const periodRow = ws1.addRow([])
    ws1.mergeCells('B4:F4')
    const periodCell = ws1.getCell('B4')
    periodCell.value = periodText
    periodCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: '64748B' } }
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(4).height = 24

    ws1.addRow([]) // spacer

    // --- KPI CARDS ---
    const kpiStartRow = 6
    const kpiData = [
      ['Total Responden', totalRespondents.toString(), ''],
      ['Hari Ini', todayCount.toString(), ''],
      ['Bulan Ini', monthCount.toString(), ''],
      ['Tingkat Kepuasan', `${averageSatisfaction}%`, ''],
      ['Skor Rata-rata', `${avgScore} / 4`, ''],
      ['Jumlah Unit', unitRankings.length.toString(), ''],
      ['Jumlah Pertanyaan', questions.length.toString(), ''],
    ]

    const kpiHeaderRow = ws1.addRow([])
    ws1.mergeCells(`B${kpiStartRow}:F${kpiStartRow}`)
    const kpiHeaderCell = ws1.getCell(`B${kpiStartRow}`)
    kpiHeaderCell.value = 'KPI LAPORAN'
    kpiHeaderCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: TEXT_DARK } }
    kpiHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } }
    kpiHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(kpiStartRow).height = 30

    kpiData.forEach((item, i) => {
      const row = ws1.addRow([])
      ws1.mergeCells(`B${kpiStartRow + 1 + i}:C${kpiStartRow + 1 + i}`)
      ws1.mergeCells(`D${kpiStartRow + 1 + i}:F${kpiStartRow + 1 + i}`)

      const labelCell = ws1.getCell(`B${kpiStartRow + 1 + i}`)
      labelCell.value = item[0]
      labelCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: TEXT_DARK } }
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
      labelCell.alignment = { vertical: 'middle', horizontal: 'left' }
      labelCell.border = {
        top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
      }

      const valueCell = ws1.getCell(`D${kpiStartRow + 1 + i}`)
      valueCell.value = item[1]
      valueCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: BLUE_RS } }
      valueCell.alignment = { vertical: 'middle', horizontal: 'center' }
      valueCell.border = {
        top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
        right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
      }
      ws1.getRow(kpiStartRow + 1 + i).height = 24
    })

    ws1.addRow([]) // spacer

    // --- Satisfaction Distribution ---
    const distStartRow = kpiStartRow + 1 + kpiData.length + 1
    const distHeaderRow = ws1.addRow([])
    ws1.mergeCells(`B${distStartRow}:F${distStartRow}`)
    const distHeaderCell = ws1.getCell(`B${distStartRow}`)
    distHeaderCell.value = 'DISTRIBUSI KEPUASAN'
    distHeaderCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: TEXT_DARK } }
    distHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } }
    distHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(distStartRow).height = 30

    const distHeaders = ['Status', 'Jumlah', 'Persentase']
    const distHeaderRow2 = ws1.addRow([])
    ws1.mergeCells(`B${distStartRow + 1}:C${distStartRow + 1}`)
    ws1.mergeCells(`D${distStartRow + 1}:D${distStartRow + 1}`)
    ws1.mergeCells(`E${distStartRow + 1}:F${distStartRow + 1}`)
    distHeaders.forEach((h, idx) => {
      const cols = ['B', 'D', 'E']
      const cell = ws1.getCell(`${cols[idx]}${distStartRow + 1}`)
      cell.value = h
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: WHITE } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_RS } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    ws1.getRow(distStartRow + 1).height = 24

    const distData = [
      { status: 'Sangat Puas', count: distSangatPuas, pct: totalRespondents > 0 ? Math.round(distSangatPuas / totalRespondents * 100 * 100) / 100 : 0 },
      { status: 'Puas', count: distPuas, pct: totalRespondents > 0 ? Math.round(distPuas / totalRespondents * 100 * 100) / 100 : 0 },
      { status: 'Cukup', count: distCukup, pct: totalRespondents > 0 ? Math.round(distCukup / totalRespondents * 100 * 100) / 100 : 0 },
      { status: 'Kurang Puas', count: distKurangPuas, pct: totalRespondents > 0 ? Math.round(distKurangPuas / totalRespondents * 100 * 100) / 100 : 0 },
    ]

    distData.forEach((d, i) => {
      const row = ws1.addRow([])
      ws1.mergeCells(`B${distStartRow + 2 + i}:C${distStartRow + 2 + i}`)
      ws1.mergeCells(`D${distStartRow + 2 + i}:D${distStartRow + 2 + i}`)
      ws1.mergeCells(`E${distStartRow + 2 + i}:F${distStartRow + 2 + i}`)

      const statusCell = ws1.getCell(`B${distStartRow + 2 + i}`)
      statusCell.value = d.status
      statusCell.font = { name: 'Arial', size: 10, color: { argb: TEXT_DARK } }
      const statusColor = d.status === 'Sangat Puas' ? GREEN : d.status === 'Puas' ? BLUE_RS : d.status === 'Cukup' ? YELLOW : RED
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } }
      statusCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: WHITE } }
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' }
      statusCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }

      const countCell = ws1.getCell(`D${distStartRow + 2 + i}`)
      countCell.value = d.count
      countCell.font = { name: 'Arial', size: 10, color: { argb: TEXT_DARK } }
      countCell.alignment = { horizontal: 'center', vertical: 'middle' }
      countCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }

      const pctCell = ws1.getCell(`E${distStartRow + 2 + i}`)
      pctCell.value = d.pct / 100
      pctCell.numFmt = '0.00%'
      pctCell.font = { name: 'Arial', size: 10, color: { argb: TEXT_DARK } }
      pctCell.alignment = { horizontal: 'center', vertical: 'middle' }
      pctCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      ws1.getRow(distStartRow + 2 + i).height = 24
    })

    ws1.addRow([]) // spacer

    // --- Best/Worst Unit Highlights ---
    const highlightStartRow = distStartRow + 2 + 4 + 1
    const hlHeaderRow = ws1.addRow([])
    ws1.mergeCells(`B${highlightStartRow}:F${highlightStartRow}`)
    const hlHeaderCell = ws1.getCell(`B${highlightStartRow}`)
    hlHeaderCell.value = 'HIGHLIGHT UNIT'
    hlHeaderCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: TEXT_DARK } }
    hlHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } }
    hlHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(highlightStartRow).height = 30

    const highlights = [
      { label: 'Unit Terbaik', value: bestUnit ? `${bestUnit.name} (${bestUnit.avgPct}%)` : '-', color: GREEN },
      { label: 'Unit Perlu Perhatian', value: worstUnit ? `${worstUnit.name} (${worstUnit.avgPct}%)` : '-', color: RED },
    ]

    highlights.forEach((h, i) => {
      const row = ws1.addRow([])
      ws1.mergeCells(`B${highlightStartRow + 1 + i}:C${highlightStartRow + 1 + i}`)
      ws1.mergeCells(`D${highlightStartRow + 1 + i}:F${highlightStartRow + 1 + i}`)

      const labelCell = ws1.getCell(`B${highlightStartRow + 1 + i}`)
      labelCell.value = h.label
      labelCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: TEXT_DARK } }
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
      labelCell.alignment = { vertical: 'middle', horizontal: 'left' }
      labelCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }

      const valueCell = ws1.getCell(`D${highlightStartRow + 1 + i}`)
      valueCell.value = h.value
      valueCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: h.color } }
      valueCell.alignment = { vertical: 'middle', horizontal: 'center' }
      valueCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      ws1.getRow(highlightStartRow + 1 + i).height = 24
    })

    // ==================== SHEET 2: Statistik Unit ====================
    const ws2 = wb.addWorksheet('Statistik Unit', {
      properties: { tabColor: { argb: '084298' } }
    })

    const unitCols = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Unit Layanan', key: 'unit', width: 28 },
      { header: 'Jumlah Responden', key: 'count', width: 18 },
      { header: 'Total Skor', key: 'totalScore', width: 14 },
      { header: 'Skor Maksimal', key: 'maxScore', width: 16 },
      { header: 'Skor Rata-rata', key: 'avgScore', width: 16 },
      { header: 'Tingkat Kepuasan', key: 'avgPct', width: 18 },
      { header: 'Status', key: 'status', width: 18 },
    ]
    ws2.columns = unitCols

    // Header style
    const ws2Header = ws2.getRow(1)
    ws2Header.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } }
    ws2Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_RS } }
    ws2Header.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    ws2Header.height = 28

    unitRankings.forEach((u, i) => {
      const row = ws2.addRow({
        no: i + 1,
        unit: u.name,
        count: u.count,
        totalScore: u.totalScore,
        maxScore: u.maxScore,
        avgScore: u.avgScore,
        avgPct: u.avgPct / 100,
        status: u.status
      })
      row.getCell('avgPct').numFmt = '0.00%'
      row.getCell('avgScore').numFmt = '0.00'
      row.font = { name: 'Arial', size: 10 }
      row.alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell('unit').alignment = { horizontal: 'left', vertical: 'middle' }
      row.height = 22
      // Color status
      const statusCell = row.getCell('status')
      if (u.status === 'Sangat Puas') statusCell.font = { color: { argb: GREEN }, bold: true }
      else if (u.status === 'Puas') statusCell.font = { color: { argb: BLUE_RS }, bold: true }
      else if (u.status === 'Cukup') statusCell.font = { color: { argb: YELLOW }, bold: true }
      else statusCell.font = { color: { argb: RED }, bold: true }
    })

    // Auto-filter and freeze
    ws2.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: unitRankings.length + 1, column: unitCols.length }
    }
    ws2.views = [{ state: 'frozen', ySplit: 1 }]

    // Border all cells
    ws2.eachRow((row, rowNum) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
        }
        if (rowNum % 2 === 0 && rowNum > 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
        }
      })
    })

    // ==================== SHEET 3: Statistik Pertanyaan ====================
    const ws3 = wb.addWorksheet('Statistik Pertanyaan', {
      properties: { tabColor: { argb: '084298' } }
    })

    const qCols = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Pertanyaan', key: 'question', width: 40 },
      { header: 'Jumlah Jawaban', key: 'count', width: 16 },
      { header: 'Total Skor', key: 'totalScore', width: 14 },
      { header: 'Skor Maksimal', key: 'maxScore', width: 16 },
      { header: 'Rata-rata', key: 'avgScore', width: 14 },
      { header: 'Persentase', key: 'pct', width: 14 },
      { header: 'Status', key: 'status', width: 18 },
    ]
    ws3.columns = qCols

    const ws3Header = ws3.getRow(1)
    ws3Header.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } }
    ws3Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_RS } }
    ws3Header.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    ws3Header.height = 28

    questionStats.forEach((q, i) => {
      const row = ws3.addRow({
        no: i + 1,
        question: q.questionText,
        count: q.count,
        totalScore: q.totalScore,
        maxScore: q.maxScore,
        avgScore: q.avgScore,
        pct: q.pct / 100,
        status: q.status
      })
      row.getCell('pct').numFmt = '0.00%'
      row.getCell('avgScore').numFmt = '0.00'
      row.font = { name: 'Arial', size: 10 }
      row.alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell('question').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      row.height = 28

      const statusCell = row.getCell('status')
      if (q.status === 'Sangat Baik') statusCell.font = { color: { argb: GREEN }, bold: true }
      else if (q.status === 'Baik') statusCell.font = { color: { argb: BLUE_RS }, bold: true }
      else if (q.status === 'Cukup') statusCell.font = { color: { argb: YELLOW }, bold: true }
      else statusCell.font = { color: { argb: RED }, bold: true }
    })

    ws3.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: questionStats.length + 1, column: qCols.length }
    }
    ws3.views = [{ state: 'frozen', ySplit: 1 }]

    ws3.eachRow((row, rowNum) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
        }
        if (rowNum % 2 === 0 && rowNum > 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
        }
      })
    })

    // ==================== SHEET 4: Data Responden ====================
    const ws4 = wb.addWorksheet('Data Responden', {
      properties: { tabColor: { argb: '16A34A' } }
    })

    const rCols = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Tanggal', key: 'date', width: 16 },
      { header: 'Jam', key: 'time', width: 10 },
      { header: 'Nama', key: 'name', width: 22 },
      { header: 'Jenis Kelamin', key: 'gender', width: 16 },
      { header: 'Usia', key: 'age', width: 8 },
      { header: 'Pendidikan', key: 'education', width: 16 },
      { header: 'Pekerjaan', key: 'occupation', width: 18 },
      { header: 'Jenis Layanan', key: 'paymentType', width: 18 },
      { header: 'Unit Layanan', key: 'serviceType', width: 22 },
      { header: 'Total Skor', key: 'totalScore', width: 14 },
      { header: 'Persentase Kepuasan', key: 'pct', width: 18 },
      { header: 'Status Kepuasan', key: 'status', width: 18 },
    ]
    ws4.columns = rCols

    const ws4Header = ws4.getRow(1)
    ws4Header.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } }
    ws4Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    ws4Header.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    ws4Header.height = 28

    respondents.forEach((resp, i) => {
      const respScore = resp.responses.reduce((sum, r) => sum + r.score, 0)
      const respMax = resp.responses.length * 4
      const respPct = respMax > 0 ? (respScore / respMax) * 100 : 0
      const status = getSatisfactionStatus(respPct)

      const row = ws4.addRow({
        no: i + 1,
        date: new Date(resp.surveyDate).toLocaleDateString('id-ID'),
        time: resp.surveyTime,
        name: resp.name || 'Anonim',
        gender: resp.gender === 'L' ? 'Laki-laki' : resp.gender === 'P' ? 'Perempuan' : resp.gender,
        age: resp.age,
        education: resp.education,
        occupation: resp.occupation,
        paymentType: resp.paymentType || '-',
        serviceType: unitLabel(resp.serviceType),
        totalScore: respScore,
        pct: respPct / 100,
        status
      })
      row.getCell('pct').numFmt = '0.00%'
      row.font = { name: 'Arial', size: 10 }
      row.alignment = { vertical: 'middle', horizontal: 'center' }
      row.getCell('name').alignment = { horizontal: 'left', vertical: 'middle' }
      row.getCell('occupation').alignment = { horizontal: 'left', vertical: 'middle' }
      row.getCell('serviceType').alignment = { horizontal: 'left', vertical: 'middle' }
      row.height = 22

      const statusCell = row.getCell('status')
      if (status === 'Sangat Puas') statusCell.font = { color: { argb: GREEN }, bold: true }
      else if (status === 'Puas') statusCell.font = { color: { argb: BLUE_RS }, bold: true }
      else if (status === 'Cukup') statusCell.font = { color: { argb: YELLOW }, bold: true }
      else statusCell.font = { color: { argb: RED }, bold: true }
    })

    ws4.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: respondents.length + 1, column: rCols.length }
    }
    ws4.views = [{ state: 'frozen', ySplit: 1 }]

    ws4.eachRow((row, rowNum) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
        }
        if (rowNum % 2 === 0 && rowNum > 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
        }
      })
    })

    // ==================== SHEET 5: Data Jawaban ====================
    const ws5 = wb.addWorksheet('Data Jawaban', {
      properties: { tabColor: { argb: 'F59E0B' } }
    })

    const aCols = [
      { header: 'No Responden', key: 'respNo', width: 14 },
      { header: 'Tanggal', key: 'date', width: 16 },
      { header: 'Unit Layanan', key: 'unit', width: 22 },
      { header: 'Pertanyaan', key: 'question', width: 40 },
      { header: 'Jawaban', key: 'answer', width: 22 },
      { header: 'Skor', key: 'score', width: 8 },
    ]
    ws5.columns = aCols

    const ws5Header = ws5.getRow(1)
    ws5Header.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } }
    ws5Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW } }
    ws5Header.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    ws5Header.height = 28

    let answerRowNum = 0
    respondents.forEach((resp, i) => {
      resp.responses.forEach((r) => {
        answerRowNum++
        const row = ws5.addRow({
          respNo: i + 1,
          date: new Date(resp.surveyDate).toLocaleDateString('id-ID'),
          unit: unitLabel(resp.serviceType),
          question: r.question.questionText,
          answer: r.answerOption.optionText,
          score: r.score
        })
        row.font = { name: 'Arial', size: 10 }
        row.alignment = { vertical: 'middle', horizontal: 'center' }
        row.getCell('question').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
        row.getCell('answer').alignment = { horizontal: 'left', vertical: 'middle' }
        row.getCell('unit').alignment = { horizontal: 'left', vertical: 'middle' }
        row.height = 22
      })
    })

    ws5.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: answerRowNum + 1, column: aCols.length }
    }
    ws5.views = [{ state: 'frozen', ySplit: 1 }]

    ws5.eachRow((row, rowNum) => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          bottom: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          left: { style: 'thin', color: { argb: GRAY_MEDIUM } },
          right: { style: 'thin', color: { argb: GRAY_MEDIUM } }
        }
        if (rowNum % 2 === 0 && rowNum > 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } }
        }
      })
    })

    // --- Generate file ---
    const buffer = await wb.xlsx.writeBuffer()

    // Determine filename
    const now = new Date()
    const startPart = startDateStr ? formatDateFile(new Date(startDateStr)) : formatDateFile(now)
    const endPart = endDateStr ? formatDateFile(new Date(endDateStr)) : formatDateFile(now)
    const filename = `Laporan_Kepuasan_Pasien_${startPart}_${endPart}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.byteLength.toString()
      }
    })
  } catch (error: any) {
    console.error('Export Excel error:', error?.message || error)
    console.error('Stack:', error?.stack)
    return NextResponse.json(
      { error: 'Gagal membuat laporan Excel. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}