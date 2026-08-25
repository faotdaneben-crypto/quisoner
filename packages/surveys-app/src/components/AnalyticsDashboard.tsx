'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Calendar, TrendingUp, Star, Building2, ListChecks,
  Loader2, AlertCircle, LogOut, Award, AlertTriangle,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { getStoredUser, clearSession, type AuthUser } from '@/lib/session'
import { roleLabel } from '@/lib/authz'

export interface AnalyticsData {
  summary: {
    totalRespondents: number
    todayCount: number
    monthCount: number
    satisfactionPercentage: number
    averageScore: number
    totalUnits: number
    totalQuestions: number
  }
  unitStats: Array<{ code: string; name: string; count: number; satisfaction: number; averageScore: number }>
  questionStats: Array<{ questionNumber: number; questionText: string; count: number; average: number; percentage: number }>
  paymentTypeStats: Array<{ code: string; name: string; count: number; percentage: number }>
  trend: Array<{ label: string; month: string; count: number; satisfaction: number }>
  bestUnit: { code: string; name: string; count: number; satisfaction: number } | null
  worstUnit: { code: string; name: string; count: number; satisfaction: number } | null
}

function unitStatus(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'Sangat Baik', color: 'text-[#16A34A]' }
  if (pct >= 80) return { label: 'Baik', color: 'text-[#0B5ED7]' }
  if (pct >= 70) return { label: 'Cukup', color: 'text-[#D97706]' }
  return { label: 'Perlu Perhatian', color: 'text-[#DC2626]' }
}

interface AnalyticsDashboardProps {
  title: string
  subtitle: string
  /** scope unit untuk KEPALA_UNIT (label unit yang sedang dilihat) */
  scopeUnitName?: string | null
  /** apakah role ini boleh melihat export (tombol export) */
  canExport?: boolean
  /** tampilkan ringkasan jenis layanan */
  showPayment?: boolean
}

export default function AnalyticsDashboard({ title, subtitle, scopeUnitName, canExport = true, showPayment = true }: AnalyticsDashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Client-only: baca user setelah mount agar tidak ada mismatch server/client.
    setUser(getStoredUser())
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, startDate, endDate, serviceType, paymentType])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceType) params.append('serviceType', serviceType)
      if (paymentType) params.append('paymentType', paymentType)

      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/analytics?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Gagal memuat data')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearSession()
    router.push('/admin/login')
  }

  const s = data?.summary

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#DCE6F2] sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={36} />
            <div className="min-w-0">
              <h1 className="font-bold text-[#084298] text-sm sm:text-base leading-tight truncate">{title}</h1>
              <p className="text-[10px] sm:text-xs text-[#64748B] truncate">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && (
              <span className="hidden sm:block text-xs font-medium text-[#64748B]">
                {user.name} · {roleLabel(user.role)}
                {scopeUnitName && <> · {scopeUnitName}</>}
              </span>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-all">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B]">Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B]">Tanggal Akhir</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B]">Unit Layanan</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none">
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B]">Jenis Layanan</label>
              <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="w-full px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none">
                <option value="">Semua</option>
                <option value="ktp_umum">KTP (Umum)</option>
                <option value="bpjs">BPJS</option>
                <option value="kartu_asuransi">Kartu Asuransi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-sm text-[#DC2626] flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={fetchData} className="ml-auto px-3 py-1.5 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-[#B91C1C]">Coba Lagi</button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl border border-[#DCE6F2] p-16 flex items-center justify-center">
            <Loader2 size={36} className="animate-spin text-[#0B5ED7]" />
          </div>
        )}

        {!loading && s && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <KpiCard icon={<Users size={22} />} label="Total Responden" value={s.totalRespondents} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
              <KpiCard icon={<Calendar size={22} />} label="Hari Ini" value={s.todayCount} color="text-[#16A34A]" bg="bg-[#DCFCE7]" />
              <KpiCard icon={<TrendingUp size={22} />} label="Bulan Ini" value={s.monthCount} color="text-[#D97706]" bg="bg-[#FEF3C7]" />
              <KpiCard icon={<Star size={22} />} label="Tingkat Kepuasan" value={`${s.satisfactionPercentage}%`} color="text-[#F59E0B]" bg="bg-[#FEF3C7]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard icon={<Star size={22} />} label="Skor Rata-rata" value={`${s.averageScore} / 4`} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />
              <KpiCard icon={<Building2 size={22} />} label="Jumlah Unit" value={s.totalUnits} color="text-[#0B5ED7]" bg="bg-[#EAF3FF]" />

              {/* Unit Terbaik */}
              <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5">
                <div className="flex items-center gap-2 text-[#16A34A] mb-2"><Award size={18} /> <span className="text-xs font-semibold text-[#64748B]">Unit Terbaik</span></div>
                {data.bestUnit ? (
                  <>
                    <div className="text-lg font-extrabold text-[#172033]">{data.bestUnit.name}</div>
                    <div className="text-sm font-bold text-[#16A34A]">{data.bestUnit.satisfaction}%</div>
                  </>
                ) : (
                  <p className="text-sm text-[#64748B]">Belum ada data yang cukup.</p>
                )}
              </div>

              {/* Unit Perlu Perhatian */}
              <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5">
                <div className="flex items-center gap-2 text-[#DC2626] mb-2"><AlertTriangle size={18} /> <span className="text-xs font-semibold text-[#64748B]">Perlu Perhatian</span></div>
                {data.worstUnit ? (
                  <>
                    <div className="text-lg font-extrabold text-[#172033]">{data.worstUnit.name}</div>
                    <div className="text-sm font-bold text-[#DC2626]">{data.worstUnit.satisfaction}%</div>
                  </>
                ) : (
                  <p className="text-sm text-[#64748B]">Belum ada data yang cukup.</p>
                )}
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
              <h3 className="text-lg font-bold text-[#172033] mb-4">Trend Kepuasan Pasien</h3>
              {data.trend.length === 0 ? (
                <p className="text-[#64748B] py-6 text-center">Belum ada data.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[480px]">
                    <div className="flex items-end gap-4 h-40">
                      {data.trend.map((t) => {
                        const h = Math.max(8, Math.round(t.satisfaction))
                        return (
                          <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-[#0B5ED7]">{t.satisfaction}%</span>
                            <div className="w-full bg-[#EAF3FF] rounded-t-lg" style={{ height: `${h * 1.3}px` }} />
                            <span className="text-[10px] text-[#64748B]">{t.label}</span>
                            <span className="text-[9px] text-[#94A3B8]">{t.count} resp</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kinerja Unit */}
            <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
              <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2"><Building2 size={20} className="text-[#0B5ED7]" /> Kinerja Unit Layanan</h3>
              {data.unitStats.length === 0 ? (
                <p className="text-[#64748B] py-6 text-center">Belum ada data unit.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Responden</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Kepuasan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Skor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F9FF]">
                      {data.unitStats.map((u) => {
                        const st = unitStatus(u.satisfaction)
                        return (
                          <tr key={u.code} className="hover:bg-[#F5F9FF] transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-[#172033]">{u.name}</td>
                            <td className="px-4 py-3 text-sm text-[#172033]">{u.count}</td>
                            <td className="px-4 py-3 text-sm font-bold text-[#0B5ED7]">{u.satisfaction}%</td>
                            <td className="px-4 py-3 text-sm text-[#172033]">{u.averageScore}</td>
                            <td className={`px-4 py-3 text-sm font-semibold ${st.color}`}>{st.label}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Statistik Pertanyaan (urut terendah) */}
            <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-8">
              <h3 className="text-lg font-bold text-[#172033] mb-4 flex items-center gap-2"><ListChecks size={20} className="text-[#0B5ED7]" /> Statistik Per Pertanyaan</h3>
              <p className="text-xs text-[#64748B] mb-4">Diurutkan dari nilai terendah (area yang perlu perhatian).</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Pertanyaan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Jawaban</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Rata-rata</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F9FF]">
                    {[...data.questionStats].sort((a, b) => a.percentage - b.percentage).map((q, i) => (
                      <tr key={q.questionNumber} className="hover:bg-[#F5F9FF] transition-colors">
                        <td className="px-4 py-3 text-sm text-[#64748B]">{i + 1}</td>
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
            {showPayment && data.paymentTypeStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6">
                <h3 className="text-lg font-bold text-[#172033] mb-4">Ringkasan Jenis Layanan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.paymentTypeStats.map((p) => (
                    <div key={p.code} className="bg-[#F5F9FF] rounded-xl p-4 border border-[#DCE6F2]">
                      <div className="text-sm font-semibold text-[#172033]">{p.name}</div>
                      <div className="text-xl font-extrabold text-[#0B5ED7] mt-1">{p.count}</div>
                      <div className="text-xs text-[#64748B]">{p.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
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
