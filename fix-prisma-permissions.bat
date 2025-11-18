@echo off
echo ========================================
echo Fixing Prisma Permission Issues
echo ========================================
echo.

echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes running
)
echo.

echo Step 2: Waiting for file locks to release...
timeout /t 3 /nobreak >nul
echo.

echo Step 3: Generating Prisma clients...
call npm run prisma:generate
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ SUCCESS! Prisma clients generated
    echo ========================================
) else (
    echo ========================================
    echo ❌ FAILED! Try these steps:
    echo ========================================
    echo 1. Close ALL terminals and VS Code/Cursor
    echo 2. Open a NEW terminal as Administrator
    echo 3. Run: npm run prisma:generate
    echo ========================================
)

pause

