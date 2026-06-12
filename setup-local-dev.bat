@echo off
REM Local Development Setup Script for Windows
REM CI Management Application - Without Docker

echo ========================================
echo CI Management App - Local Setup
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/5] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL service and try again.
    echo.
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running
echo.

REM Check Java
echo [2/5] Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH!
    echo Please install Java JDK 17+ and try again.
    echo.
    pause
    exit /b 1
)
java -version
echo.

REM Check Maven
echo [3/5] Checking Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed or not in PATH!
    echo Please install Maven and try again.
    echo.
    pause
    exit /b 1
)
mvn -version
echo.

REM Check Node.js
echo [4/5] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ and try again.
    echo.
    pause
    exit /b 1
)
node -v
npm -v
echo.

REM Database setup instructions
echo [5/5] Database Setup Required
echo ========================================
echo Please run these SQL commands in PostgreSQL:
echo.
echo CREATE DATABASE cims_db;
echo CREATE USER cims_user WITH PASSWORD 'cims_password';
echo GRANT ALL PRIVILEGES ON DATABASE cims_db TO cims_user;
echo \c cims_db
echo GRANT ALL ON SCHEMA public TO cims_user;
echo.
echo ========================================
echo.

REM Ask if database is set up
set /p db_ready="Have you created the database? (y/n): "
if /i not "%db_ready%"=="y" (
    echo.
    echo Please set up the database first, then run this script again.
    echo See docs/LOCAL_DEVELOPMENT_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Starting Application Setup...
echo ========================================
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo [OK] Frontend dependencies installed
echo.

REM Build backend
echo Building backend...
cd backend
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend built successfully
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   mvn spring-boot:run
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo Login: admin / admin123
echo.
echo See docs/LOCAL_DEVELOPMENT_SETUP.md for more details.
echo.
pause

@REM Made with Bob
