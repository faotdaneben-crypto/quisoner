'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, FileSpreadsheet, FileDown, Calendar, Filter,
  Loader2, Users, Star, TrendingUp, Building2, ListChecks, AlertCircle,
} from 'lucide-react'

interface ReportData {
  summary: {
    totalRespondents: number
    todayCount: number
    monthCount: number
    satisfactionPercentage: number
    averageScore: number
    totalUnits: number
    totalQuestions: number
  }
  unitStats: Array<{ code: string; name: string; count: number; satisfaction: number }>
  questionStats: Array<{ questionNumber: number; questionText: string; count: number; average: number; percentage: number }>
  paymentTypeStats: Array<{ code: string; name: string; count: number; percentage: number }>
}

function getStatus(pct: number): { label: string; color: string } {
  if (pct >= 80) return { label: 'Sangat Puas', color: 'text-[#16A34A]' }
  if (pct >= 70) return { label: 'Puas', color: 'text-[#0B5ED7]' }
  if (pct >= 60) return { label: 'Cukup', color: 'text-[#D97706]' }
  return { label: 'Kurang Puas', color: 'text-[#DC2626]' }
}

export default function ReportsPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceType) params.append('serviceType', serviceType)

      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/reports/data?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Gagal memuat data laporan')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, serviceType])

  async function handleExportExcel() {
    if (exportingExcel || exportingPdf) return
    setExportingExcel(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceType) params.append('serviceType', serviceType)

      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/reports/export-excel?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Gagal membuat laporan')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      a.download = filenameMatch ? decodeURIComponent(filenameMatch[1]) : 'Laporan_Kepuasan_Pasien.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Gagal membuat laporan')
    } finally {
      setExportingExcel(false)
    }
  }

  async function handleExportPdf() {
    if (exportingExcel || exportingPdf) return
    setExportingPdf(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceType) params.append('serviceType', serviceType)

      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/reports/export-pdf?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Gagal membuat laporan')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      a.download = filenameMatch ? decodeURIComponent(filenameMatch[1]) : 'Laporan_Kepuasan_Pasien.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Gagal membuat laporan')
    } finally {
      setExportingPdf(false)
    }
  }

  const s = data?.summary

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#172033] mb-6 flex items-center gap-2">
          <FileText size={24} className="text-[#0B5ED7]" />
          Laporan Kuesioner
        </h1>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0B5ED7] to-[#084298] rounded-2xl p-8 sm:p-12 text-white mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Laporan Kepuasan Pasien</h2>
          <p className="text-white/80">RS Baiturrahim Jambi</p>
        </div>

        {/* Filter & Export */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
          <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
            <Filter size={18} className="text-[#0B5ED7]" />
            Filter & Export Laporan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172033]">Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172033]">Tanggal Akhir</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172033]">Unit Layanan</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none">
                <option value="">Semua Unit</option>
                <option value="igd">IGD</option>
                <option value="laboratorium">Laboratorium</option>
                <option value="fisioterapi">Fisioterapi</option>
                <option value="poli">Poli</option>
                <option value="farmasi">Farmasi</option>
                <option value="rawat-inap">Rawat Inap</option>
                <option value="kamar-bersalin">Kamar Bersalin</option>
                <option value="poliklinik">Poliklinik</option>
                <option value="hemodialisa">Hemodialisa</option>
                <option value="mcu">MCU</option>
                <option value="icu">ICU</option>
                <option value="kamar-operasi">Kamar Operasi</option>
                <option value="registrasi">Registrasi</option>
                <option value="radiologi">Radiologi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={fetchData} className="px-4 py-2.5 bg-[#EAF3FF] text-[#0B5ED7] text-sm font-semibold rounded-xl hover:bg-[#0B5ED7] hover:text-white transition-all">
              Terapkan Filter
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel || exportingPdf}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#15803D] transition-all shadow-lg shadow-[#16A34A]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exportingExcel ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
              Download Excel
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exportingExcel || exportingPdf}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#DC2626] text-white font-semibold rounded-xl hover:bg-[#B91C1C] transition-all shadow-lg shadow-[#DC2626]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exportingPdf ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
              Download PDF
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-sm text-[#DC2626] flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#DCE6F2] p-12 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#0B5ED7]" />
          </div>
        )}

        {/* Content */}
        {!loading && s && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard icon={<Users size={22} />} label="Total Responden" value={s.totalRespondents} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
              <KpiCard icon={<Calendar size={22} />} label="Hari Ini" value={s.todayCount} color="text-[#16A34A]" bg="bg-[#DCFCE7]" />
              <KpiCard icon={<TrendingUp size={22} />} label="Bulan Ini" value={s.monthCount} color="text-[#D97706]" bg="bg-[#FEF3C7]" />
              <KpiCard icon={<Star size={22} />} label="Tingkat Kepuasan" value={`${s.satisfactionPercentage}%`} color="text-[#F59E0B]" bg="bg-[#FEF3C7]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard icon={<Star size={22} />} label="Skor Rata-rata" value={`${s.averageScore} / 4`} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
              <KpiCard icon={<Building2 size={22} />} label="Jumlah Unit" value={s.totalUnits} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
              <KpiCard icon={<ListChecks size={22} />} label="Jumlah Pertanyaan" value={s.totalQuestions} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
            </div>

            {/* Kinerja Unit */}
            <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
              <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-[#0B5ED7]" />
                Kinerja Unit Layanan
              </h3>
              {data.unitStats.length === 0 ? (
                <p className="text-[#64748B] py-6 text-center">Belum ada data unit.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Unit Layanan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Responden</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Kepuasan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F9FF]">
                      {data.unitStats.map((u, i) => {
                        const st = getStatus(u.satisfaction)
                        return (
                          <tr key={u.code} className="hover:bg-[#F5F9FF] transition-colors">
                            <td className="px-4 py-3 text-sm text-[#64748B]">{i + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-[#172033]">{u.name}</td>
                            <td className="px-4 py-3 text-sm text-[#172033]">{u.count}</td>
                            <td className="px-4 py-3 text-sm font-bold text-[#0B5ED7]">{u.satisfaction}%</td>
                            <td className={`px-4 py-3 text-sm font-semibold ${st.color}`}>{st.label}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Statistik Per Pertanyaan */}
            <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
              <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
                <ListChecks size={20} className="text-[#0B5ED7]" />
                Statistik Per Pertanyaan
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Pertanyaan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Jumlah Jawaban</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Rata-rata</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F9FF]">
                    {data.questionStats.map((q) => (
                      <tr key={q.questionNumber} className="hover:bg-[#F5F9FF] transition-colors">
                        <td className="px-4 py-3 text-sm text-[#64748B]">{q.questionNumber}</td>
                        <td className="px-4 py-3 text-sm text-[#172033]">{q.questionText}</td>
                        <td className="px-4 py-3 text-sm text-[#172033]">{q.count}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#172033]">{q.average}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#0B5ED7]">{q.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ringkasan Jenis Layanan */}
            {data.paymentTypeStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6">
                <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-[#0B5ED7]" />
                  Ringkasan Jenis Layanan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Jenis Layanan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F9FF]">
                      {data.paymentTypeStats.map((p) => (
                        <tr key={p.code} className="hover:bg-[#F5F9FF] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#172033]">{p.name || p.code}</td>
                          <td className="px-4 py-3 text-sm text-[#172033]">{p.count}</td>
                          <td className="px-4 py-3 text-sm font-bold text-[#0B5ED7]">{p.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-extrabold text-[#172033]">{value}</div>
      <p className="text-sm text-[#64748B] mt-1">{label}</p>
    </div>
  )
}
