@echo off
REM CIMS Quick Start Script for Windows
REM This script helps you quickly set up and run the CIMS application

setlocal enabledelayedexpansion

echo ==========================================
echo CIMS - Quick Start Script
echo ==========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)
echo [OK] Docker Compose is installed
echo.

:menu
echo.
echo What would you like to do?
echo 1) Start all services (Docker)
echo 2) Stop all services
echo 3) View logs
echo 4) Rebuild and restart
echo 5) Clean up (remove containers and volumes)
echo 6) Check service status
echo 7) Setup for local development
echo 8) Exit
echo.
set /p choice="Enter your choice [1-8]: "

if "%choice%"=="1" goto start_services
if "%choice%"=="2" goto stop_services
if "%choice%"=="3" goto view_logs
if "%choice%"=="4" goto rebuild_services
if "%choice%"=="5" goto cleanup
if "%choice%"=="6" goto check_status
if "%choice%"=="7" goto setup_local_dev
if "%choice%"=="8" goto exit_script
echo [ERROR] Invalid choice. Please try again.
goto menu

:start_services
echo.
echo [INFO] Starting all services...
cd docker
docker-compose up -d
if %errorlevel% equ 0 (
    echo [OK] Services started successfully!
    echo.
    echo [INFO] Access the application at:
    echo   - Frontend: http://localhost:3000
    echo   - Backend API: http://localhost:8080
    echo   - API Documentation: http://localhost:8080/swagger-ui.html
    echo   - PgAdmin (dev): http://localhost:5050
    echo.
    echo [INFO] Default admin credentials:
    echo   - Email: admin@cims.com
    echo   - Password: Admin@123
) else (
    echo [ERROR] Failed to start services
)
cd ..
goto menu

:stop_services
echo.
echo [INFO] Stopping all services...
cd docker
docker-compose down
if %errorlevel% equ 0 (
    echo [OK] Services stopped successfully!
) else (
    echo [ERROR] Failed to stop services
)
cd ..
goto menu

:view_logs
echo.
echo Which service logs would you like to view?
echo 1) All services
echo 2) Backend
echo 3) Frontend
echo 4) PostgreSQL
echo.
set /p log_choice="Enter your choice [1-4]: "

cd docker
if "%log_choice%"=="1" docker-compose logs -f
if "%log_choice%"=="2" docker-compose logs -f backend
if "%log_choice%"=="3" docker-compose logs -f frontend
if "%log_choice%"=="4" docker-compose logs -f postgres
cd ..
goto menu

:rebuild_services
echo.
echo [INFO] Rebuilding and restarting services...
cd docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d
if %errorlevel% equ 0 (
    echo [OK] Services rebuilt and restarted successfully!
) else (
    echo [ERROR] Failed to rebuild services
)
cd ..
goto menu

:cleanup
echo.
echo [WARNING] This will remove all containers, volumes, and data.
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    cd docker
    docker-compose down -v
    echo [OK] Cleanup completed!
    cd ..
) else (
    echo [INFO] Cleanup cancelled
)
goto menu

:check_status
echo.
echo [INFO] Checking service status...
cd docker
docker-compose ps
cd ..
pause
goto menu

:setup_local_dev
echo.
echo [INFO] Setting up local development environment...
echo.

REM Check Java
where java >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Java is installed
    java -version
) else (
    echo [ERROR] Java is not installed. Please install Java 17 or higher.
)
echo.

REM Check Maven
where mvn >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Maven is installed
    mvn -version | findstr "Apache Maven"
) else (
    echo [ERROR] Maven is not installed. Please install Maven 3.8 or higher.
)
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed
    node -v
) else (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
)
echo.

REM Check npm
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] npm is installed
    npm -v
) else (
    echo [ERROR] npm is not installed.
)
echo.

echo [INFO] For detailed setup instructions, see docs\SETUP_GUIDE.md
pause
goto menu

:exit_script
echo.
echo [INFO] Goodbye!
exit /b 0

@REM Made with Bob
