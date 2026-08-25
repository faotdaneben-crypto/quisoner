'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Filter, ChevronLeft, ChevronRight, Eye, User, Calendar, Clock, Tag, MessageSquare } from 'lucide-react'

interface Respondent {
  id: string
  surveyDate: string
  surveyTime: string
  name: string
  gender: string
  age: number
  education: string
  occupation: string
  serviceType: string
  satisfaction: number
  hasSuggestion: boolean
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function RespondentsPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([])
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedRespondent, setSelectedRespondent] = useState<Respondent | null>(null)
  const router = useRouter()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchRespondents()
  }, [])

  async function fetchRespondents(p = 1) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (serviceFilter !== 'all') params.append('serviceType', serviceFilter)
      if (genderFilter !== 'all') params.append('gender', genderFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/respondents?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      const data = await res.json()
      if (data.success) {
        setRespondents(data.data.respondents || [])
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function formatService(code: string) {
    const s: Record<string, string> = {
      'PENDAFTARAN': 'Pendaftaran', 'IGD': 'IGD', 'RAWAT_JALAN': 'Rawat Jalan',
      'RAWAT_INAP': 'Rawat Inap', 'FARMASI': 'Farmasi', 'LABORATORIUM': 'Laboratorium',
      'RADIOLOGI': 'Radiologi', 'MCU': 'Medical Check Up', 'ADMINISTRASI': 'Administrasi', 'LAINNYA': 'Lainnya'
    }
    return s[code] || code
  }

  function getSatisfactionColor(score: number) {
    if (score >= 80) return 'bg-[#DCFCE7] text-[#16A34A]'
    if (score >= 60) return 'bg-[#FEF3C7] text-[#D97706]'
    return 'bg-[#FEE2E2] text-[#DC2626]'
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[#172033] mb-6">Data Responden</h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none" />
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none">
              <option value="all">Semua Layanan</option>
              <option value="PENDAFTARAN">Pendaftaran</option>
              <option value="IGD">IGD</option>
              <option value="RAWAT_JALAN">Rawat Jalan</option>
              <option value="RAWAT_INAP">Rawat Inap</option>
              <option value="FARMASI">Farmasi</option>
            </select>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none">
              <option value="all">Semua Gender</option>
              <option value="laki-laki">Laki-laki</option>
              <option value="perempuan">Perempuan</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau layanan..." className="w-full pl-10 pr-4 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none" />
            </div>
            <button onClick={() => fetchRespondents(1)} className="px-6 py-2.5 bg-[#0B5ED7] text-white text-sm font-semibold rounded-xl hover:bg-[#084298] transition-all">Cari</button>
            <button onClick={() => { setStartDate(''); setEndDate(''); setServiceFilter('all'); setGenderFilter('all'); setSearch(''); setPage(1); }} className="px-4 py-2.5 border border-[#DCE6F2] text-sm rounded-xl hover:bg-[#F5F9FF] transition-all">Reset</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5ED7]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Usia</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Pendidikan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Layanan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Kepuasan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F9FF]">
                    {respondents.map((r, index) => (
                      <tr key={r.id} className="hover:bg-[#F5F9FF] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#64748B]">{index + 1 + ((pagination.page - 1) * pagination.limit)}</td>
                        <td className="px-6 py-4 text-sm text-[#172033] font-medium">{formatDate(r.surveyDate)}</td>
                        <td className="px-6 py-4 text-sm text-[#172033]">{r.name || 'Anonim'}</td>
                        <td className="px-6 py-4 text-sm capitalize text-[#172033]">{r.gender}</td>
                        <td className="px-6 py-4 text-sm text-[#172033]">{r.age}</td>
                        <td className="px-6 py-4 text-sm text-[#172033]">{r.education}</td>
                        <td className="px-6 py-4 text-sm text-[#172033]">{formatService(r.serviceType)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSatisfactionColor(r.satisfaction)}`}>
                            {r.satisfaction}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedRespondent(r)} className="flex items-center gap-1 px-3 py-1.5 bg-[#EAF3FF] text-[#0B5ED7] text-xs font-semibold rounded-lg hover:bg-[#0B5ED7] hover:text-white transition-all">
                            <Eye size={14} /> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                    {respondents.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center text-[#64748B]">
                          <User size={32} className="mx-auto mb-2 text-[#DCE6F2]" />
                          Belum ada data responden
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCE6F2]">
                <p className="text-sm text-[#64748B]">
                  Menampilkan {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { const p = pagination.page - 1; setPage(p); fetchRespondents(p) }} disabled={pagination.page <= 1} className="flex items-center gap-1 px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm disabled:opacity-30 hover:bg-[#F5F9FF] transition-all">
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button onClick={() => { const p = pagination.page + 1; setPage(p); fetchRespondents(p) }} disabled={pagination.page >= pagination.totalPages} className="flex items-center gap-1 px-3 py-2 border border-[#DCE6F2] rounded-lg text-sm disabled:opacity-30 hover:bg-[#F5F9FF] transition-all">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRespondent && (
        <DetailModal respondent={selectedRespondent} onClose={() => setSelectedRespondent(null)} />
      )}
    </div>
  )
}

function DetailModal({ respondent, onClose }: { respondent: Respondent; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)

  useEffect(() => { fetchDetails() }, [])

  async function fetchDetails() {
    try {
      const res = await fetch(`/api/respondents/${respondent.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      const data = await res.json()
      if (data.success) setDetails(data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function formatService(code: string) {
    const s: Record<string, string> = {
      'PENDAFTARAN': 'Pendaftaran', 'IGD': 'IGD', 'RAWAT_JALAN': 'Rawat Jalan',
      'RAWAT_INAP': 'Rawat Inap', 'FARMASI': 'Farmasi', 'LABORATORIUM': 'Laboratorium',
      'RADIOLOGI': 'Radiologi', 'MCU': 'Medical Check Up', 'ADMINISTRASI': 'Administrasi',
    }
    return s[code] || code
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#DCE6F2] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#172033]">Detail Hasil Kuesioner</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F5F9FF] rounded-lg transition-all"><X size={20} className="text-[#64748B]" /></button>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5ED7]" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-[#172033] mb-4 flex items-center gap-2"><User size={18} className="text-[#0B5ED7]" /> Data Responden</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-[#64748B]">Nama:</span> <p className="font-medium text-[#172033]">{respondent.name || 'Anonim'}</p></div>
                <div><span className="text-[#64748B]">Gender:</span> <p className="font-medium text-[#172033] capitalize">{respondent.gender}</p></div>
                <div><span className="text-[#64748B]">Usia:</span> <p className="font-medium text-[#172033]">{respondent.age} tahun</p></div>
                <div><span className="text-[#64748B]">Pendidikan:</span> <p className="font-medium text-[#172033]">{respondent.education}</p></div>
                <div><span className="text-[#64748B]">Pekerjaan:</span> <p className="font-medium text-[#172033]">{respondent.occupation}</p></div>
                <div><span className="text-[#64748B]">Layanan:</span> <p className="font-medium text-[#172033]">{formatService(respondent.serviceType)}</p></div>
                <div><span className="text-[#64748B]">Tanggal:</span> <p className="font-medium text-[#172033]">{new Date(respondent.surveyDate).toLocaleDateString('id-ID')}</p></div>
                <div><span className="text-[#64748B]">Waktu:</span> <p className="font-medium text-[#172033]">{respondent.surveyTime}</p></div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#172033] mb-4 flex items-center gap-2"><Tag size={18} className="text-[#0B5ED7]" /> Hasil Kuesioner</h3>
              <div className="space-y-3">
                {details?.responses?.map((resp: any, idx: number) => (
                  <div key={idx} className="border border-[#DCE6F2] rounded-xl p-4 hover:border-[#0B5ED7]/30 transition-all">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-[#0B5ED7] text-white rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {resp.question.questionNumber}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-[#172033] text-sm mb-1">{resp.question.questionText}</p>
                        <p className="text-sm text-[#0B5ED7] font-medium">
                          Jawaban: {resp.answerOption.optionText} <span className="text-[#64748B]">(Skor: {resp.answerOption.score})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#EAF3FF] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#64748B] text-sm">Total Skor</span>
                  <p className="text-xl font-bold text-[#172033]">{details?._totalScore}/36</p>
                </div>
                <div>
                  <span className="text-[#64748B] text-sm">Tingkat Kepuasan</span>
                  <p className="text-xl font-bold text-[#0B5ED7]">{details?._satisfaction}%</p>
                </div>
              </div>
            </div>

            {details?.suggestion && (
              <div>
                <h3 className="font-bold text-[#172033] mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-[#0B5ED7]" /> Saran Pasien</h3>
                <div className="bg-[#F5F9FF] rounded-xl p-4 border border-[#DCE6F2]">
                  <p className="text-[#172033] italic">&ldquo;{details.suggestion.suggestion}&rdquo;</p>
                  <p className="text-xs text-[#64748B] mt-2">Status: {details.suggestion.status}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}