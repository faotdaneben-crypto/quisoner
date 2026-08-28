import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-dvh bg-white text-[#172033] overflow-x-clip flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9F0F9] sticky top-0 z-50">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo + Text */}
            <div className="flex items-center gap-3 min-w-0">
              <Logo size={40} priority />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-[#0B5ED7] leading-tight truncate">
                  RS BAITURRAHIM JAMBI
                </h1>
                <p className="text-[11px] sm:text-xs text-[#64748B] truncate">
                  Sistem Kuesioner Kepuasan Pasien
                </p>
              </div>
            </div>
            {/* Admin Button */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#0B5ED7] border border-[#0B5ED7]/25 hover:bg-[#EAF3FF] rounded-lg transition-colors duration-200 flex-shrink-0 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 min-w-0">
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B5ED7] uppercase tracking-wide">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Survei Kepuasan Pasien
            </p>

            {/* Hero Heading */}
            <h1 className="text-[2rem] leading-[1.12] sm:text-4xl lg:text-5xl font-bold text-[#0B5ED7] tracking-tight break-word">
              Bantu Kami
              <br />
              Meningkatkan
              <br />
              <span className="text-[#172033]">Pelayanan</span>
            </h1>

            {/* Paragraph */}
            <p className="text-sm sm:text-base text-[#64748B] max-w-md leading-relaxed break-word">
              Pendapat Anda sangat berarti bagi kami untuk terus meningkatkan kualitas
              pelayanan di RS Baiturrahim Jambi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/survey"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B5ED7] text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-[#084298] transition-colors duration-200 min-h-[48px] whitespace-nowrap"
              >
                Mulai Kuesioner
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <a
                href="#info"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#0B5ED7]/30 text-[#0B5ED7] font-semibold text-sm sm:text-base rounded-lg hover:bg-[#EAF3FF] transition-colors duration-200 min-h-[48px] whitespace-nowrap"
              >
                Info Lebih Lanjut
              </a>
            </div>
          </div>

          {/* Right Illustration - hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-xl border border-[#E9F0F9] shadow-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-[#E9F0F9]">
                  <span className="text-sm font-semibold text-[#172033]">Survei Kepuasan</span>
                  <svg className="ml-auto w-5 h-5 text-[#0B5ED7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-[#DCE6F2] flex-shrink-0" />
                      <div className={`h-2 rounded bg-[#E9F0F9] ${i % 2 === 0 ? 'w-4/5' : 'w-3/5'}`} />
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <div className="h-9 bg-[#0B5ED7] rounded-lg w-full flex items-center justify-center text-white text-xs font-medium">
                    Kirim Jawaban
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="info" className="bg-[#F8FBFF] border-t border-[#E9F0F9]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cepat & Mudah */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 bg-[#EAF3FF] rounded-lg flex items-center justify-center text-[#0B5ED7] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#172033] text-sm sm:text-base">CEPAT &amp; MUDAH</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-1 break-word">
                  Hanya membutuhkan waktu kurang dari 5 menit untuk mengisi kuesioner.
                </p>
              </div>
            </div>

            {/* Data Aman & Terpercaya */}
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 bg-[#EAF3FF] rounded-lg flex items-center justify-center text-[#0B5ED7] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#172033] text-sm sm:text-base">DATA AMAN &amp; TERPERCAYA</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-1 break-word">
                  Jawaban Anda dikelola secara aman dan digunakan sebagai bahan evaluasi
                  untuk meningkatkan kualitas pelayanan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FBFF] border-t border-[#E9F0F9] mt-auto">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#64748B] text-center sm:text-left">
              &copy; 2026 RS Baiturrahim Jambi &mdash; Sistem Kuesioner Kepuasan Pasien
            </p>
            <div className="flex items-center gap-5 flex-shrink-0">
              <span className="text-xs text-[#64748B] whitespace-nowrap">Jambi, Indonesia</span>
              <span className="text-xs text-[#64748B] whitespace-nowrap">Versi 1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
