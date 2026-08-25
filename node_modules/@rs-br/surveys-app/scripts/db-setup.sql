-- Database creation script for System Kuesioner Kepuasan Pasien
-- Run this on PostgreSQL server to create the database

-- 1. Create database
CREATE DATABASE surveys_db;

-- 2. Connect to database (in psql, this would be: \c surveys_db)
-- Use connection string: postgresql://username:password@localhost/surveys_db

-- Note: Actual tables are created via Prisma migrations
-- Run these commands in project directory instead:
--   npx prisma db push
--   npx prisma db seed
