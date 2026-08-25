import { NextRequest, NextResponse } from 'next/server'
import { getSurveyStatistics } from '@/lib/survey-stats'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

export async function GET(req: NextRequest) {
  const gate = await requirePermission(req, 'export')
  if ('response' in gate) return gate.response

  try {
    // Dynamic imports for PDF generation
    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const searchParams = req.nextUrl.searchParams
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const serviceType = searchParams.get('serviceType') || ''

    const filters = {
      startDate: startDateStr || undefined,
      endDate: endDateStr || undefined,
      serviceType: serviceType || undefined,
    }

    // SINGLE SOURCE OF TRUTH
    const stats = await getSurveyStatistics(filters)

    // --- KPIs ---
    const totalRespondents = stats.summary.totalRespondents
    const todayCount = stats.summary.todayCount
    const monthCount = stats.summary.monthCount
    const averageSatisfaction = stats.summary.satisfactionPercentage
    const avgScore = stats.summary.averageScore

    // Unit stats
    const unitRankings = stats.unitStats.map((u) => ({
      name: u.name,
      count: u.count,
      avgPct: u.satisfaction,
      status: getSatisfactionStatus(u.satisfaction),
    }))

    // Question stats
    const questionStats = stats.questionStats.map((q) => ({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      count: q.count,
      avgScore: q.average,
      pct: q.percentage,
    }))

    // --- BUILD PDF ---
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 15

    // Header
    doc.setFillColor(8, 66, 152) // BLUE_DARK
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RS BAITURRAHIM JAMBI', pageWidth / 2, 12, { align: 'center' })
    doc.setFontSize(12)
    doc.text('LAPORAN KEPUASAN PASIEN', pageWidth / 2, 21, { align: 'center' })

    const periodText = startDateStr && endDateStr
      ? `${formatDateID(new Date(startDateStr))} - ${formatDateID(new Date(endDateStr))}`
      : 'Semua Data'
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(`Periode: ${periodText}`, pageWidth / 2, 29, { align: 'center' })

    y = 42

    // KPI Section
    doc.setDrawColor(11, 94, 215)
    doc.setLineWidth(0.5)
    doc.line(15, y, pageWidth - 15, y)

    y += 8
    doc.setFontSize(13)
    doc.setTextColor(23, 32, 51)
    doc.setFont('helvetica', 'bold')
    doc.text('KPI LAPORAN', 15, y)

    y += 10

    // KPI cards (2x2 grid)
    const kpiItems = [
      { label: 'Total Responden', value: totalRespondents.toString() },
      { label: 'Tingkat Kepuasan', value: `${averageSatisfaction}%` },
      { label: 'Skor Rata-rata', value: `${avgScore} / 4` },
      { label: 'Hari Ini / Bulan Ini', value: `${todayCount} / ${monthCount}` },
    ]

    const cardW = (pageWidth - 40) / 2
    const cardH = 20
    const startX = 15

    kpiItems.forEach((item, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = startX + col * (cardW + 10)
      const cy = y + row * (cardH + 8)

      doc.setFillColor(234, 243, 255)
      doc.roundedRect(x, cy, cardW, cardH, 3, 3, 'F')
      doc.setDrawColor(11, 94, 215)
      doc.setLineWidth(0.3)
      doc.roundedRect(x, cy, cardW, cardH, 3, 3, 'S')

      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'normal')
      doc.text(item.label, x + 4, cy + 7)

      doc.setFontSize(13)
      doc.setTextColor(11, 94, 215)
      doc.setFont('helvetica', 'bold')
      doc.text(item.value, x + 4, cy + 16)
    })

    y += 2 * (cardH + 8) + 10

    // Unit Rankings Table
    doc.setFontSize(13)
    doc.setTextColor(23, 32, 51)
    doc.setFont('helvetica', 'bold')
    doc.text('KINERJA UNIT LAYANAN', 15, y)
    y += 8

    const unitTableData = unitRankings.map((u, i) => [
      (i + 1).toString(),
      u.name,
      u.count.toString(),
      `${u.avgPct}%`,
      u.status
    ])

    autoTable(doc, {
      startY: y,
      head: [['No', 'Unit Layanan', 'Responden', 'Kepuasan', 'Status']],
      body: unitTableData,
      headStyles: {
        fillColor: [11, 94, 215],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [23, 32, 51]
      },
      alternateRowStyles: {
        fillColor: [245, 249, 255]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' }
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.text[0]
          if (status === 'Sangat Puas') {
            data.cell.textColor = [22, 163, 74]
          } else if (status === 'Puas') {
            data.cell.textColor = [11, 94, 215]
          } else if (status === 'Cukup') {
            data.cell.textColor = [245, 158, 11]
          } else {
            data.cell.textColor = [220, 38, 38]
          }
          data.cell.fontStyle = 'bold'
        }
      }
    })

    y = (doc as any).lastAutoTable.finalY + 10

    // Question Statistics Table
    // Check if we need a new page
    if (y > 220) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(13)
    doc.setTextColor(23, 32, 51)
    doc.setFont('helvetica', 'bold')
    doc.text('STATISTIK PER PERTANYAAN', 15, y)
    y += 8

    const qTableData = questionStats.map((q, i) => [
      (i + 1).toString(),
      q.questionText,
      q.count.toString(),
      q.avgScore.toString(),
      `${q.pct}%`
    ])

    autoTable(doc, {
      startY: y,
      head: [['No', 'Pertanyaan', 'Jawaban', 'Rata-rata', 'Persentase']],
      body: qTableData,
      headStyles: {
        fillColor: [11, 94, 215],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [23, 32, 51]
      },
      alternateRowStyles: {
        fillColor: [245, 249, 255]
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' }
      }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Dicetak: ${formatDateID(new Date())} | Halaman ${i} dari ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      )
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    const now = new Date()
    const startPart = startDateStr ? formatDateFile(new Date(startDateStr)) : formatDateFile(now)
    const endPart = endDateStr ? formatDateFile(new Date(endDateStr)) : formatDateFile(now)
    const filename = `Laporan_Kepuasan_Pasien_${startPart}_${endPart}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBuffer.byteLength.toString()
      }
    })
  } catch (error: any) {
    console.error('Export PDF error:', error?.message || error)
    console.error('Stack:', error?.stack)
    return NextResponse.json(
      { error: 'Gagal membuat laporan PDF. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}