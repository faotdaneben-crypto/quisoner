# Sistem Kuesioner Kepuasan Pasien - RS Baiturrahim Jambi

Aplikasi web modern untuk digitalisasi kuesioner kepuasan pasien dengan dashboard admin real-time, statistik otomatis, dan fitur lengkap.

## 🎯 Fitur Utama

### Untuk Pasien
- ✅ Formulir mobile-first yang mudah digunakan
- ✅ 9 pertanyaan kuesioner standar
- ✅ Input data responden (nama opsional, gender, usia, pendidikan, pekerjaan)
- ✅ Pilihan jenis layanan yang diterima
- ✅ Saran & masukan (opsional)
- ✅ Konfirmasi sukses setelah submit
- ✅ Tidak perlu login atau akun

### Untuk Admin
- ✅ Login authentication dengan JWT
- ✅ Dashboard statistik real-time:
  - Total responden
  - Responden hari ini
  - Responden bulan ini
  - Rata-rata kepuasan (%)
- ✅ Ranking unit layanan (peringkat kepuasan)
- ✅ Top area yang perlu diperbaiki
- ✅ Detail setiap pertanyaan dengan distribusi jawaban
- ✅ Filter berdasarkan: tanggal, layanan, gender, pendidikan
- ✅ Halaman data responden dengan pagination & search
- ✅ Detail hasil per pasien (termasuk semua jawaban)
- ✅ Manajemen saran & masukan dengan status tracking
- ✅ Generator QR Code untuk berbagai unit
- ✅ Export laporan Excel & PDF (ready to implement)

## 🔧 Tech Stack

**Backend:**
- Next.js 15 (API Routes)
- Prisma ORM
- PostgreSQL database
- bcryptjs untuk password hashing
- JWT untuk authentication

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS (custom theme)
- Lucide React (icons)
- Framer Motion (animations)

**Security:**
- Password hashing dengan bcrypt
- JWT token authentication
- SQL injection protection via Prisma
- XSS & input validation dengan zod
- Role-based access control

## 📁 Struktur Project

```
packages/surveys-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Initial data seeding
├── src/
│   ├── app/
│   │   ├── survey/            # Patient survey page
│   │   ├── admin/
│   │   │   ├── login/         # Admin authentication
│   │   │   ├── dashboard/     # Main stats dashboard
│   │   │   ├── respondents/   # Data responden list
│   │   │   ├── suggestions/   # Saran management
│   │   │   ├── reports/       # Report export
│   │   │   ├── qr-codes/      # QR generator
│   │   │   └── settings/      # App configuration
│   │   └── api/               # API endpoints
│   │       ├── auth/login/
│   │       ├── surveys/submit/
│   │       ├── questions/
│   │       ├── dashboard/summary/
│   │       ├── respondents/
│   │       └── services/
│   ├── components/            # UI components
│   ├── lib/                   # Utilities
│   │   ├── database.ts        # DB functions
│   │   ├── auth.ts            # Auth helpers
│   │   └── supabase.ts        # Supabase client
│   └── types/                 # TypeScript types
└── package.json
```

## 🗃️ Database Schema

### Core Tables

**users** - Admin accounts
```prisma
id, name, username, email, passwordHash, role, createdAt
```

**services** - Service units (multi-unit support)
```prisma
id, name, code, isActive, createdAt
```

**questions** - Survey questions
```prisma
id, questionText, questionNumber, category, isActive, displayOrder
```

**answer_options** - Answer choices with scoring
```prisma
id, questionId, optionText, score, displayOrder
```

**respondents** - Patient demographic data
```prisma
id, surveyDate, surveyTime, name?, gender, age, education, occupation, serviceType, ipAddress, sessionId
```

**responses** - Individual answers
```prisma
id, respondentId, questionId, answerOptionId, score
```

**suggestions** - Patient feedback
```prisma
id, respondentId, suggestion, status, createdAt
```

**audit_logs** - Admin activity tracking
```prisma
id, userId, action, entity, entityId, oldValue, newValue, ipAddress, createdAt
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running on port 5432
- npm or pnpm

### Installation Steps

1. **Install dependencies**
```bash
cd packages/surveys-app
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database connection string
```

Example `.env`:
```env
DATABASE_URL="postgresql://username:pass@localhost:5432/surveys_db"
JWT_SECRET=your-super-secret-key-change-this
```

3. **Setup database**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
```

5. **Access application**
- Patient Survey: http://localhost:3001/survey
- Admin Login: http://localhost:3001/admin/login

**Demo Credentials:**
- Username: `admin`
- Password: `Admin123!`

## 📊 Scoring System

Setiap jawaban memiliki skor 1-4:

| Jawaban | Skor |
|---------|------|
| Tidak Sesuai/Sangat Kurang | 1 |
| Kurang Sesuai/Cukup | 2 |
| Sesuai/Baik | 3 |
| Sangat Sesuai/Sangat Baik | 4 |

**Rumus Persentase Kepuasan:**
```
Total Skor Aktual / (Jumlah Pertanyaan × 4) × 100%
```

Contoh: 34/36 × 100 = 94.44%

## 🔐 Security Features

✅ **Authentication**: JWT token (24h expiry)
✅ **Password Hashing**: bcrypt cost factor 10
✅ **Authorization**: Role-based (ADMIN, SUPER_ADMIN)
✅ **Input Validation**: Zod schemas on frontend & backend
✅ **SQL Injection Protection**: Prisma parameterized queries
✅ **Audit Logging**: All admin actions logged
✅ **Session Tracking**: Device fingerprinting (optional)

## 🌐 API Endpoints

### Public (No Auth Required)

```
POST /api/questions           Get available questions
POST /api/surveys/submit      Submit completed survey
```

### Protected (JWT Token Required)

```
POST /api/auth/login          Admin login → returns token
GET  /api/dashboard/summary   Dashboard statistics
GET  /api/respondents         List all respondents (with filters)
GET  /api/services            List service units
```

**Example API Call:**
```bash
curl -X GET http://localhost:3001/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 Responsive Design

Application is fully responsive and tested on:
- Desktop (1920x1080+)
- Laptop (1366x768)
- Tablet (iPad Air, Android tablets)
- Mobile (iPhone 6+, Android 5+)

Mobile optimizations:
- Large touch targets (min 44px)
- Readable font sizes (16px base)
- Stacked layouts on small screens
- Touch-friendly form controls

## 🎨 Design System

**Colors:**
- Primary: Blue (#3b82f6) - Trust, medical
- Secondary: Teal (#14b8a6) - Health, calm
- Success: Green (#22c55e)
- Warning: Yellow (#eab308)
- Error: Red (#ef4444)

**Typography:**
- Inter font family
- Headings: Bold, clear hierarchy
- Body: 16px for readability

## 📈 Future Enhancements (Ready to Implement)

1. **Real-time Updates** - WebSocket notifications when new survey submitted
2. **PDF Export** - Professional report generation
3. **Excel Export** - Detailed data export for analysis
4. **Email Notifications** - Alert admin of critical feedback
5. **Advanced Analytics** - Trend charts, comparison over time
6. **Custom Questions** - Admin can add/edit questions dynamically
7. **Multi-language** - Bahasa Indonesia + English
8. **Offline Mode** - PWA support for low-connectivity areas

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Open Prisma Studio
npm run db:studio
```

## 📞 Support

For issues or questions:
1. Check INSTALLATION.md in project root
2. Review database schema in prisma/schema.prisma
3. Consult Next.js documentation for deployment

## 📝 License

Proprietary software for RS Baiturrahim Jambi. Not for redistribution.

---

Built with ❤️ for better patient experience at RS Baiturrahim Jambi
