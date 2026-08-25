import { z } from 'zod'

// Survey submission validation
export const submitSurveySchema = z.object({
  surveyTime: z.enum(['08.00 – 12.00', '13.00 – 17.00']),
  name: z.string().optional(),
  gender: z.enum(['laki-laki', 'perempuan']),
  age: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 149, {
    message: 'Usia harus antara 1-149 tahun',
  }),
  education: z.enum([
    'SD', 'SMP', 'SMA', 'S1', 'S2', 'S3', 'TIDAK_SEKOLAH', 'LAINNYA'
  ]),
  occupation: z.enum(['PNS', 'TNI', 'POLRI', 'SWASTA', 'WIRAUSAHA', 'LAINNYA']),
  serviceType: z.enum([
    'PENDAFTARAN', 'IGD', 'RAWAT_JALAN', 'RAWAT_INAP',
    'FARMASI', 'LABORATORIUM', 'RADIOLOGI', 'MCU', 'ADMINISTRASI', 'LAINNYA'
  ], { errorMap: () => ({ message: 'Jenis layanan wajib dipilih' }) }),
  responses: z.array(z.object({
    questionId: z.string(),
    answerOptionId: z.string(),
  })).min(9, { message: 'Semua pertanyaan harus dijawab' }),
  suggestion: z.string().max(1000).optional().default(''),
})

// Dashboard filter validation
export const dashboardFilterSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  serviceType: z.enum([
    'PENDAFTARAN', 'IGD', 'RAWAT_JALAN', 'RAWAT_INAP',
    'FARMASI', 'LABORATORIUM', 'RADIOLOGI', 'MCU', 'ADMINISTRASI'
  ]).optional(),
  gender: z.enum(['laki-laki', 'perempuan']).optional(),
  education: z.enum(['SD', 'SMP', 'SMA', 'S1', 'S2', 'S3', 'TIDAK_SEKOLAH', 'LAINNYA']).optional(),
})

// Type exports
export type SubmitSurveyInput = z.infer<typeof submitSurveySchema>
export type DashboardFilters = z.infer<typeof dashboardFilterSchema>
