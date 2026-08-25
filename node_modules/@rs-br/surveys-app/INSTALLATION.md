# INSTALLATION GUIDE - Sistem Kuesioner Kepuasan Pasien
# ==========================================================

## PREREQUISITES

1. Node.js 18+ installed
2. PostgreSQL installed and running on port 5432
3. npm or pnpm package manager

## QUICK START (3 Steps)

### Step 1: Install Dependencies

```bash
cd packages/surveys-app
npm install
```

### Step 2: Setup Database Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="postgresql://username:password@localhost:5432/surveys_db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Option A: Local PostgreSQL**

1. Create database: `createdb surveys_db`
2. Use connection string above

**Option B: Supabase Only** (Recommended for Production)
- Go to https://supabase.com
- Create new project
- Copy connection strings to `.env`

### Step 3: Initialize Database & Seed Data

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

This will:
- Generate Prisma Client
- Create all tables in database
- Insert demo admin user (admin/Admin123!)
- Insert 9 survey questions
- Insert service units (Pendaftaran, IGD, etc.)

## RUNNING THE APP

Development Server:

```bash
npm run dev
```

Access:
- Patient Survey: http://localhost:3001/survey
- Admin Login: http://localhost:3001/admin/login
- Dashboard: http://localhost:3001/admin/dashboard

Demo Credentials:
- Username: admin
- Password: Admin123!

## PRODUCTION BUILD

```bash
npm run build
npm start
```

## API ENDPOINTS

### Public APIs (No Auth Required)
- POST /api/questions - Get available questions
- POST /api/surveys/submit - Submit completed survey

### Protected APIs (Admin Token Required)
- POST /api/auth/login - Admin login, returns JWT token
- GET /api/dashboard/summary - Dashboard statistics
- GET /api/respondents - List all respondents with filters
- GET /api/services - List service units

### Example Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:3001/api/dashboard/summary
```

## DATABASE SCHEMA

Tables:
- users (admins)
- services (service units)
- questions (survey questions)
- answer_options (question answers with scores)
- respondents (patient data)
- responses (individual question answers)
- suggestions (patient feedback)
- audit_logs (admin activity tracking)

## FEATURES IMPLEMENTED

✅ Patient survey form (mobile-first design)
✅ 9 survey questions with scoring system
✅ Real-time dashboard with statistics
✅ Filter by date range, service type, gender
✅ Detailed respondent view
✅ Suggestion management
✅ QR code generator placeholder
✅ Multi-unit support (services)
✅ Security: JWT authentication, password hashing
✅ Validation: zod schemas on both frontend/backend
✅ Responsive design for mobile/desktop/tablet

## NEXT STEPS (To be implemented)

- PDF export with proper formatting
- Excel export with detailed data
- Charts using Recharts library
- WebSocket real-time notifications
- Advanced analytics page
- Question management UI
- Settings/configuration page
- Service unit CRUD operations