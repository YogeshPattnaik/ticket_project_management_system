@echo off
echo Fixing Prisma file lock issue...
echo.

echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ All Node processes stopped
) else (
    echo ℹ️  No Node processes were running
)
echo.

echo Step 2: Waiting for file system to release locks...
timeout /t 3 /nobreak >nul
echo.

echo Step 3: Deleting locked Prisma files...
if exist "node_modules\.prisma\client\query_engine-windows.dll.node" (
    del /F /Q "node_modules\.prisma\client\query_engine-windows.dll.node" 2>nul
    echo ✅ Deleted locked query engine file
) else (
    echo ℹ️  No locked file found
)

if exist "node_modules\.prisma\client\query_engine-windows.dll.node.tmp*" (
    del /F /Q "node_modules\.prisma\client\query_engine-windows.dll.node.tmp*" 2>nul
    echo ✅ Deleted temporary files
)
echo.

echo Step 4: Generating Prisma clients...
call npm run prisma:generate
echo.

if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Prisma clients generated successfully
) else (
    echo ❌ FAILED! Try running as Administrator or restart your computer
)
pause

