'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Calendar, Filter, RefreshCw, AlertTriangle } from 'lucide-react'

interface Suggestion {
  id: string
  date: string
  time: string
  name: string
  serviceType: string
  paymentType: string
  suggestion: string
  status: 'new' | 'read' | 'followed_up' | 'resolved'
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'new', label: 'Baru' },
  { value: 'read', label: 'Dibaca' },
  { value: 'followed_up', label: 'Ditindaklanjuti' },
  { value: 'resolved', label: 'Selesai' },
]

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFrom) params.append('startDate', dateFrom)
      if (dateTo) params.append('endDate', dateTo)

      const token = localStorage.getItem('adminToken')
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/suggestions?${params}`, { headers })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      if (data.success) {
        setSuggestions(data.data || [])
      } else {
        throw new Error(data.error || 'Invalid API response')
      }
    } catch (err: any) {
      console.error('Fetch suggestions error:', err)
      setError('Gagal memuat saran & masukan.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, dateFrom, dateTo])

  useEffect(() => { fetchSuggestions() }, [fetchSuggestions])

  async function updateStatus(id: string, newStatus: Suggestion['status']) {
    // Optimistic update
    const prev = suggestions
    setSuggestions(s => s.map(x => x.id === id ? { ...x, status: newStatus } : x))

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update')
      }
    } catch (err: any) {
      console.error('Update status error:', err)
      setSuggestions(prev)
      setError('Gagal memperbarui status saran.')
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatService(code: string) {
    if (!code) return '—'
    const s: Record<string, string> = {
      'PENDAFTARAN': 'Pendaftaran', 'IGD': 'IGD', 'RAWAT_JALAN': 'Rawat Jalan',
      'RAWAT_INAP': 'Rawat Inap', 'FARMASI': 'Farmasi', 'LABORATORIUM': 'Laboratorium',
      'RADIOLOGI': 'Radiologi', 'MCU': 'Medical Check Up', 'ADMINISTRASI': 'Administrasi',
      'igd': 'IGD', 'laboratorium': 'Laboratorium', 'fisioterapi': 'Fisioterapi',
      'poli': 'Poli', 'farmasi': 'Farmasi', 'rawat-inap': 'Rawat Inap',
      'kamar-bersalin': 'Kamar Bersalin', 'poliklinik': 'Poliklinik',
      'hemodialisa': 'Hemodialisa', 'mcu': 'MCU', 'icu': 'ICU',
      'kamar-operasi': 'Kamar Operasi', 'registrasi': 'Registrasi', 'radiologi': 'Radiologi',
    }
    return s[code] || code
  }

  function getStatusStyle(status: string) {
    const styles: Record<string, string> = {
      'new': 'bg-[#EAF3FF] text-[#0B5ED7]',
      'read': 'bg-[#F5F9FF] text-[#64748B]',
      'followed_up': 'bg-[#FEF3C7] text-[#D97706]',
      'resolved': 'bg-[#DCFCE7] text-[#16A34A]',
    }
    return styles[status] || ''
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#172033] mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-[#0B5ED7]" />
          Saran & Masukan Pasien
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2.5 border border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] outline-none" />
            <button
              onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo('') }}
              className="px-4 py-2.5 border border-[#DCE6F2] text-sm rounded-xl hover:bg-[#F5F9FF] transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5ED7]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#DCE6F2]">
            <AlertTriangle size={40} className="mx-auto mb-3 text-[#F59E0B]" />
            <p className="text-[#64748B] mb-4">{error}</p>
            <button
              onClick={fetchSuggestions}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B5ED7] text-white text-sm font-semibold rounded-xl hover:bg-[#084298] transition-all"
            >
              <RefreshCw size={16} /> Coba Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-[#DCE6F2] p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#172033]">{s.name || 'Anonim'}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[#64748B] flex-wrap">
                      <Calendar size={14} />
                      <span>{formatDate(s.date)}</span>
                      <span className="text-[#DCE6F2]">|</span>
                      <span>{formatService(s.serviceType)}</span>
                      {s.paymentType && (
                        <>
                          <span className="text-[#DCE6F2]">|</span>
                          <span>{s.paymentType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <select
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value as Suggestion['status'])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 outline-none cursor-pointer ${getStatusStyle(s.status)}`}
                  >
                    <option value="new">Baru</option>
                    <option value="read">Dibaca</option>
                    <option value="followed_up">Ditindaklanjuti</option>
                    <option value="resolved">Selesai</option>
                  </select>
                </div>
                <div className="bg-[#F5F9FF] rounded-xl p-4 border border-[#DCE6F2]">
                  <p className="text-[#172033] leading-relaxed break-words">&ldquo;{s.suggestion}&rdquo;</p>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#DCE6F2]">
                <MessageSquare size={40} className="mx-auto mb-3 text-[#DCE6F2]" />
                <p className="text-[#64748B]">Belum ada saran atau masukan dari pasien.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
