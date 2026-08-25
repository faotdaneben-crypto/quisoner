'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'

const TOTAL_STEPS = 3

interface Question {
  id: string
  questionText: string
  questionNumber: number
  answers: Array<{
    id: string
    optionText: string
    score: number
  }>
}

interface PaymentType {
  id: string
  name: string
  code: string
}

interface ServiceUnit {
  id: string
  name: string
  code: string
}

const TIME_SLOTS = ['08.00 – 12.00', '13.00 – 17.00']

const EDUCATION_OPTIONS = [
  { value: '', label: 'Pilih pendidikan' },
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA', label: 'SMA' },
  { value: 'D3', label: 'D3' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
  { value: 'TIDAK_SEKOLAH', label: 'Tidak Sekolah' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const OCCUPATION_OPTIONS = [
  { value: '', label: 'Pilih pekerjaan' },
  { value: 'PNS', label: 'PNS' },
  { value: 'TNI', label: 'TNI' },
  { value: 'POLRI', label: 'Polri' },
  { value: 'SWASTA', label: 'Swasta' },
  { value: 'WIRAUSAHA', label: 'Wirausaha' },
  { value: 'PELAJAR', label: 'Pelajar/Mahasiswa' },
  { value: 'IRT', label: 'Ibu Rumah Tangga' },
  { value: 'TIDAK_BEKERJA', label: 'Tidak Bekerja' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const FIELD_LABELS: Record<string, string> = {
  surveyTime: 'Waktu Survei',
  name: 'Nama',
  gender: 'Jenis Kelamin',
  age: 'Usia',
  education: 'Pendidikan',
  occupation: 'Pekerjaan',
  paymentType: 'Jenis Layanan yang Diterima',
  serviceType: 'Unit Layanan',
}

export default function SurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [serviceUnits, setServiceUnits] = useState<ServiceUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    surveyTime: '',
    name: '',
    gender: '',
    age: '',
    education: '',
    occupation: '',
    paymentType: '',
    paymentTypeOther: '',
    serviceType: '',
    unitOther: '',
  })

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [suggestion, setSuggestion] = useState('')

  useEffect(() => {
    fetchQuestions()
    fetchPaymentTypes()
    fetchServiceUnits()
    const hour = new Date().getHours()
    if (hour >= 8 && hour < 12) {
      setFormData(prev => ({ ...prev, surveyTime: '08.00 – 12.00' }))
    } else if (hour >= 13 && hour < 17) {
      setFormData(prev => ({ ...prev, surveyTime: '13.00 – 17.00' }))
    } else {
      setFormData(prev => ({ ...prev, surveyTime: '08.00 – 12.00' }))
    }
  }, [])

  async function fetchQuestions() {
    try {
      setLoadError('')
      const res = await fetch('/api/questions')
      const data = await res.json()
      if (data.success) setQuestions(data.data)
      else setLoadError(data.error || 'Gagal memuat pertanyaan')
    } catch (err) {
      setLoadError('Terjadi kendala saat memuat kuesioner. Silakan coba lagi.')
    } finally { setLoading(false) }
  }

  async function fetchPaymentTypes() {
    try {
      const res = await fetch('/api/services?type=payment')
      const data = await res.json()
      if (data.success) setPaymentTypes(data.data)
    } catch (err) { /* ignore */ }
  }

  async function fetchServiceUnits() {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) setServiceUnits(data.data)
    } catch (err) { /* ignore */ }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleAnswer(questionId: string, answerOptionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answerOptionId }))
  }

  function validatePersonalInfo(): boolean {
    const requiredFields: Array<keyof typeof formData> = ['surveyTime', 'gender', 'age', 'education', 'occupation', 'paymentType', 'serviceType']
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Field "${FIELD_LABELS[field] || field}" wajib diisi`)
        return false
      }
    }
    if (formData.paymentType === 'lainnya' && !formData.paymentTypeOther.trim()) {
      setError('Sebutkan jenis layanan yang diterima')
      return false
    }
    if (formData.serviceType === 'lainnya' && !formData.unitOther.trim()) {
      setError('Sebutkan unit layanan')
      return false
    }
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 149)) {
      setError('Usia harus antara 1-149 tahun')
      return false
    }
    return true
  }

  function validateSurvey(): boolean {
    const missingQuestions = questions.filter(q => !answers[q.id])
    if (missingQuestions.length > 0) {
      setError(`Silakan jawab semua pertanyaan. Pertanyaan nomor ${missingQuestions[0].questionNumber} belum dijawab.`)
      return false
    }
    return true
  }

  async function handleSubmit() {
    setError('')
    if (!validateSurvey()) return
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        responses: questions.map(q => ({ questionId: q.id, answerOptionId: answers[q.id] })),
        suggestion,
      }
      const res = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) setStep(3)
      else setError(data.message || 'Terjadi kesalahan saat mengirim kuesioner')
    } catch (err) {
      setError('Gagal mengirim kuesioner. Silakan coba lagi.')
    } finally { setSubmitting(false) }
  }

  function handleNext() {
    setError('')
    if (step === 1) {
      if (!validatePersonalInfo()) return
      setStep(2)
    }
  }

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100)
  const isAllQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.id])

  if (loading) return <LoadingView />
  if (loadError) return <ErrorView message={loadError} onRetry={() => { setLoading(true); fetchQuestions() }} />
  if (step === 3) return <SuccessView />

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] to-white pb-8 pb-safe">
      <SurveyHeader />

      <main className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#172033]">Langkah {step} dari {TOTAL_STEPS}</span>
            <span className="text-sm font-bold text-[#0B5ED7]">{progressPercent}%</span>
          </div>
          <div className="h-2.5 bg-[#EAF3FF] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0B5ED7] to-[#084298] rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-5 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#EAF3FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#0B5ED7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#172033]">Data Responden</h2>
            </div>

            <div className="space-y-5">
              <FormSelect label="Waktu Survei" required value={formData.surveyTime} onChange={(v) => handleInputChange('surveyTime', v)} options={TIME_SLOTS.map(s => ({ value: s, label: s }))} placeholder="Pilih waktu survei" />

              <FormInput label="Nama" optional value={formData.name} onChange={(v) => handleInputChange('name', v)} placeholder="Masukkan nama Anda (boleh dikosongkan)" />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172033]">Jenis Kelamin <span className="text-[#DC2626]">*</span></label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {[{ value: 'laki-laki', label: 'Laki-laki' }, { value: 'perempuan', label: 'Perempuan' }].map(gender => (
                    <button key={gender.value} type="button" onClick={() => handleInputChange('gender', gender.value)}
                      className={`flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] border-2 rounded-xl font-medium text-base transition-all duration-200 ${
                        formData.gender === gender.value
                          ? 'border-[#0B5ED7] bg-[#EAF3FF] text-[#084298] shadow-sm'
                          : 'border-[#DCE6F2] text-[#64748B] hover:border-[#94A3B8] hover:text-[#172033] active:bg-[#F5F9FF]'
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {gender.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172033]">Usia <span className="text-[#DC2626]">*</span></label>
                <div className="relative">
                  <input type="number" inputMode="numeric" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Contoh: 25" min="1" max="120" className="input-field !pr-14" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B] pointer-events-none">tahun</span>
                </div>
              </div>

              <FormSelect label="Pendidikan" required value={formData.education} onChange={(v) => handleInputChange('education', v)} options={EDUCATION_OPTIONS.filter(o => o.value !== '').map(o => ({ value: o.value, label: o.label }))} placeholder="Pilih pendidikan" />

              <FormSelect label="Pekerjaan" required value={formData.occupation} onChange={(v) => handleInputChange('occupation', v)} options={OCCUPATION_OPTIONS.filter(o => o.value !== '').map(o => ({ value: o.value, label: o.label }))} placeholder="Pilih pekerjaan" />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172033]">Jenis Layanan yang Diterima <span className="text-[#DC2626]">*</span></label>
                <select value={formData.paymentType} onChange={(e) => handleInputChange('paymentType', e.target.value)} className="select-field">
                  <option value="">Pilih jenis layanan</option>
                  {paymentTypes.length > 0 ? paymentTypes.map(pt => <option key={pt.id} value={pt.code}>{pt.name}</option>) : (
                    <>
                      <option value="ktp_umum">KTP (Umum)</option>
                      <option value="bpjs">BPJS</option>
                      <option value="kartu_asuransi">Kartu Asuransi</option>
                      <option value="lainnya">Lainnya</option>
                    </>
                  )}
                </select>
                {formData.paymentType === 'lainnya' && (
                  <input type="text" value={formData.paymentTypeOther} onChange={(e) => handleInputChange('paymentTypeOther', e.target.value)} placeholder="Sebutkan jenis layanan" className="input-field mt-3" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#172033]">Unit Layanan <span className="text-[#DC2626]">*</span></label>
                <select value={formData.serviceType} onChange={(e) => handleInputChange('serviceType', e.target.value)} className="select-field">
                  <option value="">Pilih unit layanan</option>
                  {serviceUnits.length > 0 ? serviceUnits.map(u => <option key={u.id} value={u.code}>{u.name}</option>) : (
                    <>
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
                    </>
                  )}
                </select>
                {formData.serviceType === 'lainnya' && (
                  <input type="text" value={formData.unitOther} onChange={(e) => handleInputChange('unitOther', e.target.value)} placeholder="Sebutkan unit layanan" className="input-field mt-3" />
                )}
              </div>

              <button onClick={handleNext} className="w-full min-h-[52px] flex items-center justify-center gap-2 px-6 py-4 bg-[#0B5ED7] text-white font-semibold text-base rounded-xl hover:bg-[#084298] active:bg-[#07327A] transition-all duration-200 shadow-lg shadow-[#0B5ED7]/20">
                Lanjutkan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#EAF3FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0B5ED7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#172033]">Pertanyaan Kuesioner</h2>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className={`border-2 rounded-xl p-4 sm:p-5 transition-all duration-200 ${answers[question.id] ? 'border-[#0B5ED7]/30 bg-[#EAF3FF]/30' : 'border-[#DCE6F2] hover:border-[#94A3B8]'}`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 bg-[#0B5ED7] text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {String(question.questionNumber).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#172033] mb-4 text-sm sm:text-base">{question.questionText}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {question.answers.map(answer => (
                            <button key={answer.id} type="button" onClick={() => handleAnswer(question.id, answer.id)}
                              className={`min-h-[48px] px-4 py-3 border-2 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                                answers[question.id] === answer.id
                                  ? 'border-[#0B5ED7] bg-[#EAF3FF] text-[#084298] shadow-sm'
                                  : 'border-[#DCE6F2] text-[#64748B] hover:border-[#94A3B8] hover:text-[#172033] active:bg-[#F5F9FF]'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[question.id] === answer.id ? 'border-[#0B5ED7]' : 'border-[#DCE6F2]'}`}>
                                  {answers[question.id] === answer.id && <span className="w-2 h-2 rounded-full bg-[#0B5ED7]" />}
                                </span>
                                {answer.optionText}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-5 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#EAF3FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#0B5ED7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#172033] text-sm sm:text-base">Saran & Masukan</h3>
                <span className="text-xs text-[#64748B]">(opsional)</span>
              </div>
              <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="Tulis saran, kritik, atau masukan Anda..." rows={4} className="textarea-field" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="w-full sm:flex-1 min-h-[52px] flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#DCE6F2] text-[#64748B] font-semibold text-base rounded-xl hover:border-[#94A3B8] hover:text-[#172033] active:bg-[#F5F9FF] transition-all duration-200 order-2 sm:order-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg> Kembali
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitting || !isAllQuestionsAnswered}
                className="w-full sm:flex-1 min-h-[52px] flex items-center justify-center gap-2 px-6 py-4 bg-[#0B5ED7] text-white font-semibold text-base rounded-xl hover:bg-[#084298] active:bg-[#07327A] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#0B5ED7]/20 order-1 sm:order-2"
              >
                {submitting ? (
                  <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Mengirim...</>
                ) : (
                  <>Kirim Kuesioner <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs sm:text-sm text-[#64748B] py-4 px-4">
        &copy; {new Date().getFullYear()} RS Baiturrahim Jambi &mdash; Sistem Kuesioner Kepuasan Pasien
      </footer>
    </div>
  )
}

// --- Reusable Components ---

function SurveyHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-[#DCE6F2] sticky top-0 z-50 pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-16">
          <Logo size={36} className="sm:hidden" priority />
          <Logo size={40} className="hidden sm:inline-flex" priority />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-[#084298] leading-tight truncate">RS BAITURRAHIM JAMBI</h1>
            <p className="text-[10px] sm:text-xs text-[#64748B] truncate">Kuesioner Survei Kepuasan Pasien</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function FormInput({ label, optional, value, onChange, placeholder, type = 'text' }: {
  label: string; optional?: boolean; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#172033]">
        {label} {optional && <span className="text-[#64748B] font-normal">(opsional)</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field" />
    </div>
  )
}

function FormSelect({ label, required, value, onChange, options, placeholder }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; options: Array<{value: string; label: string}>; placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#172033]">{label} {required && <span className="text-[#DC2626]">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="select-field">
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] to-white">
      <SurveyHeader />
      <main className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse space-y-5">
          <div className="bg-white rounded-2xl border border-[#DCE6F2] p-6 md:p-8 space-y-5">
            <div className="h-6 bg-[#EAF3FF] rounded-lg w-48" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-[#EAF3FF] rounded w-20" />
                <div className="h-12 bg-[#F5F9FF] rounded-xl border border-[#DCE6F2]" />
              </div>
            ))}
            <div className="h-[52px] bg-[#EAF3FF] rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  )
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] to-white">
      <SurveyHeader />
      <main className="w-full max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#172033] mb-2">Terjadi Kendala</h2>
          <p className="text-[#64748B] mb-6">{message}</p>
          <button onClick={onRetry} className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#084298] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
        </div>
      </main>
    </div>
  )
}

function SuccessView() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-8 md:p-10 text-center">
        <div className="w-20 h-20 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] mb-2">Kuesioner Berhasil Dikirim</h1>
        <p className="text-sm sm:text-base text-[#64748B] mb-6">
          Terima kasih atas waktu dan masukan Anda. Masukan Anda membantu kami meningkatkan kualitas pelayanan RS Baiturrahim Jambi.
        </p>
        <div className="bg-[#EAF3FF] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#084298]">Data survei Anda akan digunakan untuk meningkatkan kualitas pelayanan di Rumah Sakit Baiturrahim Jambi.</p>
        </div>
        <a href="/" className="inline-flex items-center justify-center w-full min-h-[52px] px-6 py-4 bg-[#0B5ED7] text-white font-semibold rounded-xl hover:bg-[#084298] active:bg-[#07327A] transition-all">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}