import { z } from 'zod'

export const respondentSchema = z.object({
  surveyTime: z.enum(['08.00 – 12.00', '13.00 – 17.00']),
  name: z.string().optional(),
  gender: z.enum(['laki-laki', 'perempuan']),
  age: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 150, {
    message: 'Usia harus valid (1-149)'
  }),
  education: z.enum(['SD', 'SMP', 'SMA', 'S1', 'S2', 'S3', 'TIDAK_SEKOLAH', 'LAINNYA']),
  occupation: z.enum(['PNS', 'TNI', 'POLRI', 'SWASTA', 'WIRAUSAHA', 'LAINNYA']),
  serviceType: z.string().min(1, 'Jenis layanan wajib diisi'),
})

export const responseSchema = z.array(z.object({
  questionId: z.string(),
  answerOptionId: z.string(),
}))

export const suggestionSchema = z.object({
  suggestion: z.string().max(1000).optional(),
})

type SubmitSurveyInput = {
  surveyTime: string
  name?: string
  gender: string
  age: string
  education: string
  occupation: string
  serviceType: string
  responses: Array<{questionId: string; answerOptionId: string}>
  suggestion: string
}

export const submitSurveyInputSchema = respondentSchema
  .and(responseSchema)
  .and(suggestionSchema.transform(data => data.suggestion || ''))
  .transform((data: any) => {
    const [respondent, responses, suggestion] = data
    return {
      surveyTime: respondent.surveyTime,
      name: respondent.name,
      gender: respondent.gender,
      age: respondent.age,
      education: respondent.education,
      occupation: respondent.occupation,
      serviceType: respondent.serviceType,
      responses,
      suggestion: typeof suggestion === 'string' ? suggestion : '',
    }
  }) as unknown as z.ZodType<SubmitSurveyInput>
