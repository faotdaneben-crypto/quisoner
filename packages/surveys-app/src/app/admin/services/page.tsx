'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react'

interface ServiceUnit {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    try {
      const res = await fetch('/api/services?all=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      const data = await res.json()
      if (data.success) setServices(data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function toggleActive(unit: ServiceUnit) {
    try {
      const res = await fetch(`/api/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ id: unit.id, isActive: !unit.isActive })
      })
      const data = await res.json()
      if (data.success) {
        setServices(prev => prev.map(s => s.id === unit.id ? { ...s, isActive: !unit.isActive } : s))
      }
    } catch (err) { console.error(err) }
  }

  async function addService() {
    if (!newName.trim()) { setError('Nama unit wajib diisi'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ name: newName.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setServices(prev => [...prev, data.data])
        setNewName('')
        setShowAdd(false)
      } else {
        setError(data.error || 'Gagal menambah unit')
      }
    } catch (err) { setError('Gagal menambah unit') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
            <Building2 size={24} className="text-[#0B5ED7]" />
            Unit Layanan
          </h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B5ED7] text-white text-sm font-semibold rounded-xl hover:bg-[#084298] transition-all"
          >
            <Plus size={18} /> Tambah Unit
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-6">
            <h3 className="font-bold text-[#172033] mb-4">Tambah Unit Baru</h3>
            {error && <div className="mb-4 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama unit layanan"
                className="flex-1 h-12 px-4 border-2 border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none"
                onKeyDown={(e) => e.key === 'Enter' && addService()}
              />
              <button onClick={addService} disabled={saving} className="px-6 py-3 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#084298] disabled:opacity-50 transition-all">
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Simpan'}
              </button>
              <button onClick={() => { setShowAdd(false); setError('') }} className="px-4 py-3 border border-[#DCE6F2] rounded-xl hover:bg-[#F5F9FF] transition-all">Batal</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B5ED7]" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Nama Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F9FF]">
                {services.map((s, i) => (
                  <tr key={s.id} className="hover:bg-[#F5F9FF] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#64748B]">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#172033]">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B] font-mono">{s.code}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.isActive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                        {s.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {s.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${s.isActive ? 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white' : 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#16A34A] hover:text-white'}`}
                      >
                        {s.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-[#64748B]">
                      <Building2 size={32} className="mx-auto mb-2 text-[#DCE6F2]" />
                      Belum ada unit layanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}