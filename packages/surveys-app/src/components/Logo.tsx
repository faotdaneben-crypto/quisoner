import Image from 'next/image'

/**
 * Logo resmi RS Baiturrahim Jambi.
 * File sumber: public/logo/logo.png (asli 755x794, rasio ~0.95:1, transparan).
 *
 * Menggunakan next/image agar optimal & tidak blur, dengan object-fit contain
 * sehingga logo tidak pernah gepeng / terpotong / berubah aspect ratio.
 */

const SIZES = {
  sm: 32, // mobile header
  md: 40, // desktop header / sidebar
  lg: 64, // admin login
} as const

export type LogoSize = keyof typeof SIZES

interface LogoProps {
  /** Ukuran tampilan logo (default "md"). */
  size?: LogoSize | number
  /** Class tambahan untuk kontainer (mis. rounded, shadow). */
  className?: string
  /** Teks alt untuk aksesibilitas. */
  alt?: string
  /** Jadikan gambar prioritas (untuk LCP / above-the-fold). */
  priority?: boolean
}

export default function Logo({
  size = 'md',
  className = '',
  alt = 'Logo RS Baiturrahim Jambi',
  priority = false,
}: LogoProps) {
  // Ukuran piksel: pakai preset atau nilai angka langsung.
  const px = typeof size === 'number' ? size : SIZES[size]

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/logo/logo.png"
        alt={alt}
        width={px}
        height={px}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  )
}
