@echo off
REM CIMS Quick Deployment Script for Windows
REM Version: 1.0.0
REM Date: 2026-06-12

echo ==========================================
echo CIMS - Quick Deployment Script
echo ==========================================
echo.

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)
echo [OK] Docker is installed

REM Check Docker Compose
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)
echo [OK] Docker Compose is installed
echo.

REM Setup environment file
echo Setting up environment configuration...
if not exist .env (
    if exist .env.production.example (
        copy .env.production.example .env
        echo [WARNING] Created .env file from template
        echo [WARNING] IMPORTANT: Edit .env file and update all CHANGE_THIS values!
        echo.
        pause
    ) else (
        echo [ERROR] .env.production.example not found
        exit /b 1
    )
) else (
    echo [OK] .env file already exists
)
echo.

REM Build services
echo Building Docker services...
docker-compose build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build services
    exit /b 1
)
echo [OK] Services built successfully
echo.

REM Start services
echo Starting services...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started successfully
echo.

REM Wait for services
echo Waiting for services to be ready...
echo Waiting for database...
timeout /t 10 /nobreak >nul

echo Waiting for backend...
set /a attempts=0
:wait_backend
set /a attempts+=1
if %attempts% GTR 30 (
    echo [ERROR] Backend failed to start within timeout
    echo Check logs with: docker-compose logs backend
    exit /b 1
)
curl -s http://localhost:8080/actuator/health >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    timeout /t 2 /nobreak >nul
    goto wait_backend
)
echo [OK] Backend is ready

echo Waiting for frontend...
timeout /t 5 /nobreak >nul
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend is ready
) else (
    echo [WARNING] Frontend may not be ready yet
)
echo.

REM Display status
echo ==========================================
echo Deployment Status
echo ==========================================
docker-compose ps
echo.

REM Display access information
echo ==========================================
echo CIMS Deployment Complete!
echo ==========================================
echo.
echo Access URLs:
echo   Frontend:    http://localhost:3000
echo   Backend API: http://localhost:8080/api
echo   API Docs:    http://localhost:8080/swagger-ui.html
echo   Health:      http://localhost:8080/actuator/health
echo.
echo Default Credentials:
echo   Email:    admin@cims.com
echo   Password: Admin@123
echo.
echo [WARNING] IMPORTANT: Change the default password immediately!
echo.
echo Useful Commands:
echo   View logs:        docker-compose logs -f
echo   Stop services:    docker-compose down
echo   Restart services: docker-compose restart
echo   View status:      docker-compose ps
echo.
echo ==========================================
echo.
pause

@REM Made with Bob
