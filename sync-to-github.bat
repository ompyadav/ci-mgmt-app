@echo off
REM Quick GitHub Sync Script
REM Syncs all code changes from Bob IDE to GitHub

echo ========================================
echo GitHub Sync Tool
echo ========================================
echo.

REM Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not a git repository!
    echo Please run: git init
    echo.
    pause
    exit /b 1
)

REM Show current status
echo Current Status:
echo ----------------------------------------
git status
echo.

REM Ask for commit message
set /p commit_msg="Enter commit message (or press Enter for default): "

REM Use default message if empty
if "%commit_msg%"=="" (
    set commit_msg=Update: Code changes from Bob IDE
)

echo.
echo ========================================
echo Syncing Changes...
echo ========================================
echo.

REM Add all changes
echo [1/3] Staging all changes...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stage changes!
    pause
    exit /b 1
)
echo [OK] Changes staged
echo.

REM Commit changes
echo [2/3] Committing changes...
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [WARNING] Nothing to commit or commit failed
    echo.
)
echo.

REM Push to GitHub
echo [3/3] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push to GitHub!
    echo.
    echo Possible reasons:
    echo - Remote 'origin' not configured
    echo - No internet connection
    echo - Authentication failed
    echo.
    echo To configure remote:
    echo git remote add origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Sync Complete! ✓
echo ========================================
echo.
echo Your changes are now on GitHub!
echo View at: https://github.com/YOUR_USERNAME/ci-mgmt-app
echo.
pause

@REM Made with Bob
