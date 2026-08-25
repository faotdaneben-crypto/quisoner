@echo off
REM Installation script for Windows
echo ========================================
echo SISTEM KUESIONER KEPUASAN PASIEN
echo RS BAITURRAHIM JAMBI
echo ========================================
echo.

cd /d "%~dp0packages\surveys-app"

echo [1/5] Menghapus node_modules lama (jika ada)...
if exist "node_modules" rmdir /s /q node_modules
echo Done.
echo.

echo [2/5] Menginstall dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo Done.
echo.

echo [3/5] Setup environment file...
if not exist ".env" (
    copy .env.example .env
    echo Created .env from .env.example
    echo Please edit .env and configure your database connection
) else (
    echo .env already exists, skipping...
)
echo.

echo [4/5] Generate Prisma client...
call npm run db:generate
echo Done.
echo.

echo [5/5] Push schema to database and seed data...
call npm run db:push
call npm run db:seed
echo Done.
echo.

echo ========================================
echo INSTALLATION COMPLETE!
echo ========================================
echo.
echo To start the application, run:
echo   npm run dev
echo.
echo Then open: http://localhost:3001/survey
echo Admin login: http://localhost:3001/admin/login
echo Username: admin | Password: Admin123!
echo.
pause
