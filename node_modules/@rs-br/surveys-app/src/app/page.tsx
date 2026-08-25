import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F5F9FF] via-white to-[#EAF3FF] overflow-x-clip">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#DCE6F2] sticky top-0 z-50 pt-safe">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Logo + Text */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Logo size={36} className="sm:hidden" priority />
              <Logo size={40} className="hidden sm:inline-flex" priority />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-[#084298] leading-tight truncate">RS BAITURRAHIM JAMBI</h1>
                <p className="text-[10px] sm:text-xs text-[#64748B] truncate">Sistem Kuesioner Kepuasan Pasien</p>
              </div>
            </div>
            {/* Admin Button */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0B5ED7] border border-[#DCE6F2] hover:border-[#0B5ED7] rounded-lg transition-all duration-200 flex-shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#EAF3FF] text-[#0B5ED7] rounded-full text-xs sm:text-sm font-semibold">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="whitespace-nowrap">SURVEI KEPUASAN PASIEN</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-[2rem] leading-[1.08] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight break-word">
              Bantu Kami{' '}
              <span className="text-[#0B5ED7]">Meningkatkan</span>
              <br />
              Pelayanan
            </h1>

            {/* Paragraph */}
            <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-full sm:max-w-lg leading-relaxed break-word">
              Pendapat Anda sangat berarti bagi kami untuk terus meningkatkan kualitas pelayanan di Rumah Sakit Baiturrahim Jambi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/survey"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-[#0B5ED7] text-white font-semibold text-sm sm:text-base rounded-xl hover:bg-[#084298] transition-all duration-200 shadow-lg shadow-[#0B5ED7]/20 min-h-[48px] sm:min-h-[52px] whitespace-nowrap"
              >
                Mulai Kuesioner
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <a
                href="#info"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 border-2 border-[#DCE6F2] text-[#64748B] font-semibold text-sm sm:text-base rounded-xl hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-all duration-200 min-h-[48px] sm:min-h-[52px] whitespace-nowrap"
              >
                Info Lebih Lanjut
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2">
              <div className="text-center min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-[#0B5ED7]">9</div>
                <div className="text-[10px] sm:text-xs text-[#64748B] mt-1 break-word">Pertanyaan</div>
              </div>
              <div className="text-center min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-[#0B5ED7]">3</div>
                <div className="text-[10px] sm:text-xs text-[#64748B] mt-1 break-word">Langkah</div>
              </div>
              <div className="text-center min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-[#0B5ED7]">&lt;5</div>
                <div className="text-[10px] sm:text-xs text-[#64748B] mt-1 break-word">Menit</div>
              </div>
            </div>
          </div>

          {/* Right Illustration - hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EAF3FF] to-[#F5F9FF] rounded-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0B5ED7]/5 rounded-full blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-56 bg-white rounded-2xl shadow-card-hover border border-[#DCE6F2] p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#F5F9FF]">
                    <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="ml-auto text-[10px] font-bold text-[#0B5ED7]">SURVEI</span>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border-2 border-[#DCE6F2] flex-shrink-0" />
                      <div className="h-2 bg-[#F5F9FF] rounded flex-1" />
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="h-8 bg-[#0B5ED7] rounded-lg w-full opacity-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="info" className="bg-white border-t border-[#DCE6F2]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] mb-3 sm:mb-4 break-word">Mengapa Kuesioner Ini Penting?</h2>
            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto px-2 break-word">
              Setiap masukan Anda membantu kami memberikan pelayanan yang lebih baik untuk seluruh pasien RS Baiturrahim Jambi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'Cepat & Mudah',
                desc: 'Hanya membutuhkan waktu kurang dari 5 menit untuk mengisi seluruh kuesioner.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
              },
              {
                title: 'Data Aman',
                desc: 'Identitas dan jawaban Anda terlindungi. Kami menjaga kerahasiaan data responden.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
              },
              {
                title: 'Anonim',
                desc: 'Nama bersifat opsional. Anda dapat mengisi kuesioner tanpa perlu memberikan identitas.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
              },
            ].map((feature, i) => (
              <div key={i} className="bg-[#F5F9FF] rounded-2xl p-5 sm:p-6 border border-[#DCE6F2] hover:border-[#0B5ED7]/30 hover:shadow-card-hover transition-all duration-200 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EAF3FF] rounded-xl flex items-center justify-center text-[#0B5ED7] mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-[#172033] mb-1.5 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed break-word">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#DCE6F2]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Logo size={28} className="sm:hidden" />
              <Logo size={32} className="hidden sm:inline-flex" />
              <p className="text-[11px] sm:text-sm text-[#64748B] truncate">
                &copy; {new Date().getFullYear()} RS Baiturrahim Jambi &mdash; Sistem Kuesioner Kepuasan Pasien
              </p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-[#64748B] whitespace-nowrap">Jambi, Indonesia</span>
              <span className="text-[10px] sm:text-xs text-[#64748B] whitespace-nowrap">Versi 1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}