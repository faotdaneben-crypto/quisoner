'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { getStoredUser } from '@/lib/session'
import { hasPermission } from '@/lib/authz'
import {
  Users, Calendar, TrendingUp, Star, FileText, MessageSquare,
  Building2, QrCode, Settings, LogOut, Menu, X, ChevronRight,
  BarChart3, CheckCircle, AlertCircle, Download, ClipboardList,
  Activity, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface DashboardData {
  summary: {
    totalRespondents: number
    todayCount: number
    monthCount: number
    averageSatisfaction: number
  }
  questionStats: Array<{
    questionNumber: number
    questionText: string
    average: number
    distribution: Array<{ optionText: string; count: number; percentage: number }>
  }>
  serviceRankings: Array<{ name: string; average: number; count: number }>
}

const SIDEBAR_ITEMS = [
  { icon: BarChart3, label: 'Dashboard', href: '/admin/dashboard', active: true, permission: 'dashboard' as const },
  { icon: Users, label: 'Responden', href: '/admin/respondents', permission: 'respondents' as const },
  { icon: FileText, label: 'Hasil Survei', href: '/admin/reports', permission: 'reports' as const },
  { icon: MessageSquare, label: 'Saran & Masukan', href: '/admin/suggestions', permission: 'suggestions' as const },
  { icon: Building2, label: 'Unit Layanan', href: '/admin/services', permission: 'units' as const },
  { icon: QrCode, label: 'QR Code', href: '/admin/qr-codes', permission: 'qr-codes' as const },
  { icon: Users, label: 'Manajemen Pengguna', href: '/admin/users', permission: 'users' as const },
  { icon: Settings, label: 'Pengaturan', href: '/admin/settings', permission: 'settings' as const },
]

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarMobile, setSidebarMobile] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  // Baca role HANYA setelah mount (client-only) agar server & client
  // menghasilkan HTML yang identik (mencegah hydration mismatch).
  useEffect(() => {
    setRole(getStoredUser()?.role ?? null)
  }, [])

  const visibleItems = SIDEBAR_ITEMS.filter((item) => hasPermission(role, item.permission))

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchDashboard()
  }, [router])

  async function fetchDashboard() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceFilter !== 'all') params.append('serviceType', serviceFilter)

      const res = await fetch(`/api/dashboard/summary?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })

      const result = await res.json()
      if (result.success) {
        setData(result.data || result)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  function formatService(code: string) {
    const services: Record<string, string> = {
      'PENDAFTARAN': 'Pendaftaran', 'IGD': 'IGD', 'RAWAT_JALAN': 'Rawat Jalan',
      'RAWAT_INAP': 'Rawat Inap', 'FARMASI': 'Farmasi', 'LABORATORIUM': 'Laboratorium',
      'RADIOLOGI': 'Radiologi', 'MCU': 'Medical Check Up', 'ADMINISTRASI': 'Administrasi',
      'LAINNYA': 'Lainnya'
    }
    return services[code] || code
  }

  const summary = data?.summary
  const hasData = summary && summary.totalRespondents > 0

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      {/* Mobile overlay */}
      {sidebarMobile && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarMobile(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 border-r border-[#DCE6F2] ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${sidebarMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-[#DCE6F2]">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <Logo size={40} priority />
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-[#0B5ED7] text-sm leading-tight">Admin Panel</h1>
                <p className="text-xs text-[#64748B]">RS Baiturrahim</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {visibleItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setSidebarMobile(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-[#EAF3FF] text-[#0B5ED7] font-semibold'
                  : 'text-[#64748B] hover:bg-[#F5F9FF] hover:text-[#172033]'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#DC2626] hover:bg-[#FEE2E2] transition-all duration-200 mt-6"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </nav>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#DCE6F2] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F5F9FF] transition-all hidden lg:flex"
        >
          <ChevronRight size={12} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#DCE6F2] sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarMobile(true)}
                className="lg:hidden p-2 hover:bg-[#F5F9FF] rounded-lg transition-all"
              >
                <Menu size={20} className="text-[#64748B]" />
              </button>
              <h2 className="text-lg font-bold text-[#172033]">Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none"
                />
                <span className="text-[#64748B]">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none"
                />
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none"
                >
                  <option value="all">Semua Layanan</option>
                  <option value="PENDAFTARAN">Pendaftaran</option>
                  <option value="IGD">IGD</option>
                  <option value="RAWAT_JALAN">Rawat Jalan</option>
                  <option value="RAWAT_INAP">Rawat Inap</option>
                  <option value="FARMASI">Farmasi</option>
                </select>
                <button
                  onClick={fetchDashboard}
                  className="px-4 py-2 bg-[#0B5ED7] text-white text-sm font-medium rounded-lg hover:bg-[#084298] transition-all"
                >
                  Filter
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0B5ED7] to-[#084298] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  A
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#172033]">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DCE6F2] p-6 h-32" />
                ))}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                  icon={<Users size={22} />}
                  iconBg="bg-[#EAF3FF]"
                  iconColor="text-[#0B5ED7]"
                  value={summary?.totalRespondents || 0}
                  label="Total Responden"
                  trend={null}
                />
                <SummaryCard
                  icon={<CheckCircle size={22} />}
                  iconBg="bg-[#DCFCE7]"
                  iconColor="text-[#16A34A]"
                  value={summary?.todayCount || 0}
                  label="Hari Ini"
                  trend={null}
                />
                <SummaryCard
                  icon={<TrendingUp size={22} />}
                  iconBg="bg-[#EAF3FF]"
                  iconColor="text-[#0B5ED7]"
                  value={summary?.monthCount || 0}
                  label="Bulan Ini"
                  trend={null}
                />
                <SummaryCard
                  icon={<Star size={22} />}
                  iconBg="bg-[#FEF3C7]"
                  iconColor="text-[#F59E0B]"
                  value={`${summary?.averageSatisfaction || 0}%`}
                  label="Tingkat Kepuasan"
                  trend={summary?.averageSatisfaction && summary.averageSatisfaction >= 80 ? 'up' : 'down'}
                />
              </div>

              {/* Empty State */}
              {!hasData && (
                <div className="bg-white rounded-2xl border border-[#DCE6F2] p-12 text-center">
                  <div className="w-16 h-16 bg-[#F5F9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList size={32} className="text-[#64748B]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#172033] mb-2">Belum Ada Data Survei</h3>
                  <p className="text-[#64748B] max-w-md mx-auto">
                    Data hasil kuesioner akan muncul di sini setelah pasien mengisi survei kepuasan.
                  </p>
                </div>
              )}

              {/* Service Rankings */}
              {hasData && data?.serviceRankings && data.serviceRankings.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6">
                  <h3 className="text-lg font-bold text-[#172033] mb-6 flex items-center gap-2">
                    <Building2 size={20} className="text-[#0B5ED7]" />
                    Kinerja Unit Layanan
                  </h3>
                  <div className="space-y-4">
                    {data.serviceRankings.map((service, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                          index === 0 ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]' :
                          index === 1 ? 'bg-gradient-to-br from-[#94A3B8] to-[#64748B]' :
                          index === 2 ? 'bg-gradient-to-br from-[#B45309] to-[#92400E]' :
                          'bg-[#DCE6F2]'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[#172033] text-sm truncate">
                              {formatService(service.name)}
                            </span>
                            <span className="text-sm font-bold text-[#0B5ED7] ml-2">{service.average}%</span>
                          </div>
                          <div className="h-2.5 bg-[#F5F9FF] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0B5ED7] to-[#084298] rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(service.average, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-[#64748B] mt-1">{service.count} responden</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Statistics */}
              {hasData && data?.questionStats && data.questionStats.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6">
                  <h3 className="text-lg font-bold text-[#172033] mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-[#0B5ED7]" />
                    Statistik Per Pertanyaan
                  </h3>
                  <div className="space-y-5">
                    {data.questionStats.map((q) => (
                      <div key={q.questionNumber} className="border-b border-[#F5F9FF] last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-[#0B5ED7] text-white rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {q.questionNumber}
                            </span>
                            <h4 className="font-semibold text-[#172033] text-sm truncate">
                              {q.questionText}
                            </h4>
                          </div>
                          <span className="text-sm font-bold text-[#0B5ED7] ml-2">{q.average}%</span>
                        </div>
                        <div className="h-2 bg-[#F5F9FF] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(q.average, 100)}%`,
                              background: q.average >= 80 ? 'linear-gradient(90deg, #16A34A, #22C55E)' :
                                          q.average >= 60 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' :
                                          'linear-gradient(90deg, #DC2626, #EF4444)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ icon, iconBg, iconColor, value, label, trend }: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string | number
  label: string
  trend: 'up' | 'down' | null
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${
            trend === 'up' ? 'text-[#16A34A] bg-[#DCFCE7]' : 'text-[#DC2626] bg-[#FEE2E2]'
          } px-2 py-1 rounded-full`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend === 'up' ? 'Baik' : 'Perlu'}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-[#172033]">{value}</div>
      <p className="text-sm text-[#64748B] mt-1">{label}</p>
    </div>
  )
}