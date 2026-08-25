import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'RS Baiturrahim Jambi - Kuesioner Kepuasan Pasien',
  description: 'Sistem Kuesioner Kepuasan Pasien Rumah Sakit Baiturrahim Jambi',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased font-sans bg-[#F5F9FF] text-[#172033]">
        {children}
      </body>
    </html>
  )
}