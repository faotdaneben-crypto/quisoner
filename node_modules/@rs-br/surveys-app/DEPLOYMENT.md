# Production Deployment Guide for Sistem Kuesioner Kepuasan Pasien

## OPTION A: Deploy to Supabase (Recommended)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Create new project
4. Choose region closest to your location (Singapore recommended for Indonesia)
5. Set strong database password

### 2. Configure Database

Once project is created:
- Go to SQL Editor
- Copy and paste content from `prisma/schema.prisma` 
- Remove the datasource line, keep only models
- Run migration with Prisma CLI instead (see below)

### 3. Get Connection Strings

From Supabase Dashboard:
- Project Settings → Database
- Copy **Connection string** (URI mode)
- Copy **Anon/Public key** (from Settings → API)

### 4. Environment Variables

Create `.env.production`:

```env
DATABASE_URL="postgresql://postgres.YOUR_PASSWORD@aws.app.supabase.co:6543/postgres?connection_limit=10&sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
JWT_SECRET="your-super-secret-random-string-min-32-chars"
PORT=3001
```

## OPTION B: Local PostgreSQL Deployment

### Prerequisites

Install PostgreSQL 15+:
- Windows: https://www.postgresql.org/download/windows/
- Linux: `sudo apt install postgresql postgresql-contrib`
- macOS: `brew install postgresql`

### Setup Steps

1. Start PostgreSQL service
   ```bash
   sudo systemctl start postgresql   # Linux
   brew services start postgresql    # macOS
   ```

2. Create database user
   ```bash
   createuser surveys_user --password
   # Enter password when prompted
   ```

3. Create database
   ```bash
   createdb -U surveys_user surveys_db
   ```

4. Grant permissions
   ```bash
   psql -U surveys_user -d surveys_db
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO surveys_user;
   \q
   ```

5. Update .env
   ```env
   DATABASE_URL="postgresql://surveys_user:YOUR_PASSWORD@localhost:5432/surveys_db"
   ```

## DEPLOYMENT TO VERCEL

### Step 1: Push to GitHub

```bash
cd packages/surveys-app
git init
git add .
git commit -m "Initial commit: Survey system"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Import your repository
3. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
JWT_SECRET
PORT=3001
```

### Step 4: Deploy

Click "Deploy" button. Vercel will:
- Build your app
- Set up database migrations automatically
- Generate production URL

Example: https://rs-surveys.vercel.app

### Step 5: Post-Deployment

Run database seed manually via Vercel dashboard or CI:

```bash
npx prisma db push
npx prisma db seed
```

## DEPLOYMENT TO SELF-HOSTED SERVER

### Requirements

- Ubuntu 22.04 LTS or similar
- Node.js 20.x
- PM2 process manager
- Nginx reverse proxy (optional but recommended)
- SSL certificate (Let's Encrypt)

### Installation Steps

1. Install Node.js
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Install PM2
   ```bash
   sudo npm install -g pm2
   ```

3. Clone and setup application
   ```bash
   cd /var/www/rs-surveys
   git clone YOUR_REPO .
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Configure .env.production

5. Start with PM2
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

6. Setup Nginx reverse proxy

   Create `/etc/nginx/sites-available/rs-surveys`:
   ```nginx
   server {
       listen 80;
       server_name surveys.rsbaiturrahim.id;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Enable site
   ```bash
   sudo ln -s /etc/nginx/sites-available/rs-surveys /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. Setup SSL with Let's Encrypt
   ```bash
   sudo certbot --nginx -d surveys.rsbaiturrahim.id
   ```

## MONITORING & MAINTENANCE

### Log Rotation

Configure logrotate for application logs if self-hosted.

### Backup Database

Daily automated backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/surveys"
DATE=$(date +%Y%m%d)
pg_dump -h localhost -U surveys_user surveys_db > $BACKUP_DIR/surveys_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-surveys.sh
```

### Health Checks

Monitor application availability:

```bash
curl -I http://localhost:3001/api/health
```

Or use Uptime Robot / Pingdom for external monitoring.

## TROUBLESHOOTING

### Common Issues

**Build fails on Vercel:**
- Check Node version compatibility
- Review build logs for specific errors
- Try `npm run build` locally first

**Database connection error:**
- Verify DATABASE_URL format
- Check firewall rules (allow inbound connections)
- Ensure PostgreSQL is running

**CORS errors:**
- Update CORS middleware in next.config.js
- Verify frontend/backend domain configuration

### Getting Help

1. Check installation logs
2. Review environment variables
3. Examine application logs
4. Consult README.md documentation

---

Document Version: 1.0
Last Updated: 2024-01-08
