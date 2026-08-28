import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const databaseUrl =
  process.env.DATABASE_URL_POSTGRES_PRISMA_URL || process.env.DATABASE_URL

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
})

async function seed() {
  console.log('🌱 Starting database seed...')

  // IDEMPOTENT GUARD: jangan hapus/menimpa data yang sudah ada.
  // Jika pertanyaan sudah ada, berarti database sudah di-seed — skip.
  const existingQuestions = await prisma.question.count()
  if (existingQuestions > 0) {
    console.log('✓ Database sudah memiliki data (seeded). Skip.')
    return
  }

  // Buat admin user (hanya jika belum ada).
  const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10)
    await prisma.user.create({
      data: {
        name: 'Administrator',
        username: 'admin',
        email: 'admin@baiturrahim.co.id',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    })
    console.log('✓ Admin user created')
  }
  
  // Create payment types
  const paymentTypes = await Promise.all([
    prisma.paymentType.create({ data: { name: 'KTP (Umum)', code: 'ktp_umum', displayOrder: 0, isActive: true } }),
    prisma.paymentType.create({ data: { name: 'BPJS', code: 'bpjs', displayOrder: 1, isActive: true } }),
    prisma.paymentType.create({ data: { name: 'Kartu Asuransi', code: 'kartu_asuransi', displayOrder: 2, isActive: true } }),
    prisma.paymentType.create({ data: { name: 'Lainnya', code: 'lainnya', displayOrder: 3, isActive: true } }),
  ])
  console.log(`✓ ${paymentTypes.length} payment types created`)
  
  // Create service units (full list as requested)
  const services = await Promise.all([
    prisma.service.create({ data: { name: 'IGD', code: 'igd', isActive: true } }),
    prisma.service.create({ data: { name: 'Laboratorium', code: 'laboratorium', isActive: true } }),
    prisma.service.create({ data: { name: 'Fisioterapi', code: 'fisioterapi', isActive: true } }),
    prisma.service.create({ data: { name: 'Poli', code: 'poli', isActive: true } }),
    prisma.service.create({ data: { name: 'Farmasi', code: 'farmasi', isActive: true } }),
    prisma.service.create({ data: { name: 'Rawat Inap', code: 'rawat-inap', isActive: true } }),
    prisma.service.create({ data: { name: 'Kamar Bersalin', code: 'kamar-bersalin', isActive: true } }),
    prisma.service.create({ data: { name: 'Poliklinik', code: 'poliklinik', isActive: true } }),
    prisma.service.create({ data: { name: 'Hemodialisa', code: 'hemodialisa', isActive: true } }),
    prisma.service.create({ data: { name: 'MCU', code: 'mcu', isActive: true } }),
    prisma.service.create({ data: { name: 'ICU', code: 'icu', isActive: true } }),
    prisma.service.create({ data: { name: 'Kamar Operasi', code: 'kamar-operasi', isActive: true } }),
    prisma.service.create({ data: { name: 'Registrasi', code: 'registrasi', isActive: true } }),
    prisma.service.create({ data: { name: 'Radiologi', code: 'radiologi', isActive: true } }),
    prisma.service.create({ data: { name: 'Lainnya', code: 'lainnya', isActive: true } }),
  ])
  console.log(`✓ ${services.length} service units created`)
  
  // Define questions with answer options
  const questionsData = [
    {
      questionText: 'Persyaratan pelayanan dengan jenis pelayanan',
      questionNumber: 1,
      category: 'persyaratan',
      answers: [
        { optionText: 'Tidak Sesuai', score: 1 },
        { optionText: 'Kurang Sesuai', score: 2 },
        { optionText: 'Sesuai', score: 3 },
        { optionText: 'Sangat Sesuai', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
      questionNumber: 2,
      category: 'prosedur',
      answers: [
        { optionText: 'Tidak mudah', score: 1 },
        { optionText: 'Kurang mudah', score: 2 },
        { optionText: 'Mudah', score: 3 },
        { optionText: 'Sangat mudah', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
      questionNumber: 3,
      category: 'waktu',
      answers: [
        { optionText: 'Tidak cepat', score: 1 },
        { optionText: 'Kurang cepat', score: 2 },
        { optionText: 'Cepat', score: 3 },
        { optionText: 'Sangat cepat', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
      questionNumber: 4,
      category: 'biaya',
      answers: [
        { optionText: 'Sangat mahal', score: 1 },
        { optionText: 'Cukup mahal', score: 2 },
        { optionText: 'Murah', score: 3 },
        { optionText: 'Gratis', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang kesesuaian produk layanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
      questionNumber: 5,
      category: 'produk',
      answers: [
        { optionText: 'Tidak sesuai', score: 1 },
        { optionText: 'Kurang sesuai', score: 2 },
        { optionText: 'Sesuai', score: 3 },
        { optionText: 'Sangat sesuai', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
      questionNumber: 6,
      category: 'petugas',
      answers: [
        { optionText: 'Tidak kompeten', score: 1 },
        { optionText: 'Kurang kompeten', score: 2 },
        { optionText: 'Kompeten', score: 3 },
        { optionText: 'Sangat kompeten', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
      questionNumber: 7,
      category: 'petugas',
      answers: [
        { optionText: 'Tidak sopan dan ramah', score: 1 },
        { optionText: 'Kurang sopan dan ramah', score: 2 },
        { optionText: 'Sopan dan ramah', score: 3 },
        { optionText: 'Sangat sopan dan ramah', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
      questionNumber: 8,
      category: 'sarana',
      answers: [
        { optionText: 'Buruk', score: 1 },
        { optionText: 'Cukup', score: 2 },
        { optionText: 'Baik', score: 3 },
        { optionText: 'Sangat Baik', score: 4 },
      ]
    },
    {
      questionText: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
      questionNumber: 9,
      category: 'pengaduan',
      answers: [
        { optionText: 'Tidak ada', score: 1 },
        { optionText: 'Ada tapi tidak berfungsi', score: 2 },
        { optionText: 'Berfungsi kurang maksimal', score: 3 },
        { optionText: 'Dikelola dengan baik', score: 4 },
      ]
    },
  ]
  
  for (const qData of questionsData) {
    const question = await prisma.question.create({
      data: {
        questionText: qData.questionText,
        questionNumber: qData.questionNumber,
        category: qData.category,
        isActive: true,
        displayOrder: qData.questionNumber - 1
      }
    })
    
    for (let i = 0; i < qData.answers.length; i++) {
      await prisma.answerOption.create({
        data: {
          questionId: question.id,
          optionText: qData.answers[i].optionText,
          score: qData.answers[i].score,
          displayOrder: i
        }
      })
    }
    
    console.log(`✓ Question ${qData.questionNumber}: "${qData.questionText.substring(0, 50)}..."`)
  }
  
  console.log('\n✅ Database seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Username: admin')
  console.log('   Password: Admin123!')
  process.exit(0)
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})