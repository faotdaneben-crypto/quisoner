'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Plus, Pencil, Trash2, Loader2, AlertCircle, Shield, LogOut,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { getStoredUser, clearSession } from '@/lib/session'
import { roleLabel, ROLES, type Role } from '@/lib/authz'

interface UserRow {
  id: string
  name: string
  username: string
  email: string
  role: Role
  isActive: boolean
  unitId: string | null
  unitName: string | null
  createdAt: string
}

interface ServiceUnit {
  id: string
  name: string
  code: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [units, setUnits] = useState<ServiceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [saving, setSaving] = useState(false)

  // form
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'VIEWER' as Role, unitId: '' })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const u = getStoredUser()
    if (!token || u?.role !== 'SUPER_ADMIN') {
      router.push('/admin/dashboard')
      return
    }
    fetchUsers()
    fetchUnits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setUsers(data.data)
      else throw new Error(data.error || 'Gagal memuat pengguna')
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pengguna')
    } finally {
      setLoading(false)
    }
  }

  async function fetchUnits() {
    try {
      const res = await fetch('/api/services?all=true')
      const data = await res.json()
      if (data.success) setUnits(data.data || [])
    } catch { /* ignore */ }
  }

  function resetForm() {
    setForm({ name: '', username: '', email: '', password: '', role: 'VIEWER', unitId: '' })
    setEditing(null)
    setShowAdd(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

      if (editing) {
        const res = await fetch('/api/users', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            id: editing.id,
            name: form.name,
            role: form.role,
            unitId: form.role === 'KEPALA_UNIT' ? form.unitId : null,
            password: form.password || undefined,
          }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Gagal memperbarui')
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
            unitId: form.role === 'KEPALA_UNIT' ? form.unitId : null,
          }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Gagal menambah')
      }
      resetForm()
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(u: UserRow) {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
      })
      const data = await res.json()
      if (data.success) fetchUsers()
      else setError(data.error || 'Gagal mengubah status')
    } catch (err: any) {
      setError('Terjadi kesalahan')
    }
  }

  function startEdit(u: UserRow) {
    setEditing(u)
    setShowAdd(true)
    setForm({ name: u.name, username: u.username, email: u.email, password: '', role: u.role, unitId: u.unitId || '' })
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
                <Shield size={22} className="text-[#0B5ED7]" /> Manajemen Pengguna
              </h1>
              <p className="text-sm text-[#64748B]">Hanya Super Admin yang dapat mengelola akun & role.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetForm(); setShowAdd(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0B5ED7] text-white text-sm font-semibold rounded-xl hover:bg-[#084298] transition-all"
            >
              <Plus size={18} /> Tambah User
            </button>
            <button onClick={() => { clearSession(); router.push('/admin/login') }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#DC2626] hover:bg-[#FEE2E2] rounded-xl transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-sm text-[#DC2626] flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 mb-6">
            <h3 className="font-bold text-[#172033] mb-4">{editing ? `Edit User: ${editing.name}` : 'Tambah User Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#172033]">Nama</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#172033]">Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editing} className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none disabled:bg-[#F5F9FF] disabled:text-[#64748B]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#172033]">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#172033]">{editing ? 'Password Baru (kosongkan jika tetap)' : 'Password'}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#172033]">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none">
                    {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                  </select>
                </div>
                {form.role === 'KEPALA_UNIT' && (
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#172033]">Unit</label>
                    <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} required className="w-full h-11 px-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:border-[#0B5ED7] outline-none">
                      <option value="">Pilih unit</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#084298] disabled:opacity-50 transition-all">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Simpan'}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 border border-[#DCE6F2] rounded-xl hover:bg-[#F5F9FF] transition-all">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#DCE6F2] overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#0B5ED7]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F9FF] border-b border-[#DCE6F2]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F9FF]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F5F9FF] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#172033]">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-[#64748B]">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF3FF] text-[#0B5ED7]">{roleLabel(u.role)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#172033]">{u.unitName || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}
                        >
                          {u.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => startEdit(u)} className="flex items-center gap-1 px-3 py-1.5 bg-[#EAF3FF] text-[#0B5ED7] text-xs font-semibold rounded-lg hover:bg-[#0B5ED7] hover:text-white transition-all">
                          <Pencil size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-16 text-center text-[#64748B]"><Users size={32} className="mx-auto mb-2 text-[#DCE6F2]" /> Belum ada pengguna</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
