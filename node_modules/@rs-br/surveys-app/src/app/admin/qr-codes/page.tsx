'use client'

import { useState } from 'react'
import { QrCode, Download, Printer, Copy, Check } from 'lucide-react'

export default function QrCodeGenerator() {
  const [selectedUnit, setSelectedUnit] = useState('')
  const [copied, setCopied] = useState(false)

  const surveyUrl = selectedUnit
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/survey?unit=${selectedUnit}`
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/survey`

  function handleCopy() {
    navigator.clipboard.writeText(surveyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#172033] mb-6 flex items-center gap-2">
          <QrCode size={24} className="text-[#0B5ED7]" />
          Generator QR Code
        </h1>

        <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 md:p-8 space-y-6">
          <div>
            <p className="text-[#64748B] mb-4">
              Pilih unit layanan untuk menghasilkan QR Code yang akan mengarahkan pasien ke formulir kuesioner.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#172033]">Unit Layanan</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DCE6F2] rounded-xl text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:border-[#0B5ED7] outline-none"
              >
                <option value="">Semua Unit - Link Umum</option>
                <option value="PENDAFTARAN">Pendaftaran</option>
                <option value="IGD">IGD</option>
                <option value="RAWAT_JALAN">Rawat Jalan</option>
                <option value="RAWAT_INAP">Rawat Inap</option>
                <option value="FARMASI">Farmasi</option>
                <option value="LABORATORIUM">Laboratorium</option>
                <option value="RADIOLOGI">Radiologi</option>
                <option value="MCU">Medical Check Up</option>
              </select>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="border-2 border-dashed border-[#DCE6F2] rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="w-48 h-48 bg-white border-2 border-[#172033] rounded-xl flex items-center justify-center mb-4">
              <div className="grid grid-cols-5 gap-1 p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${
                      // Pola deterministik (bukan Math.random) agar server & client identik.
                      (i * 7 + 3) % 5 < 3 ? 'bg-[#172033]' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-[#64748B] text-center break-all max-w-xs">
              {surveyUrl || 'http://localhost:3013/survey'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#DCE6F2] text-[#172033] font-semibold rounded-xl hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-all"
            >
              {copied ? <Check size={18} className="text-[#16A34A]" /> : <Copy size={18} />}
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#084298] transition-all shadow-lg shadow-[#0B5ED7]/20">
              <Download size={18} />
              Download QR
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#15803D] transition-all shadow-lg shadow-[#16A34A]/20">
              <Printer size={18} />
              Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}