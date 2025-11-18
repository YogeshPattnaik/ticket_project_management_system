# 🔧 Fix Prisma EPERM Error (Windows)

## The Problem
Windows is locking the Prisma query engine file, preventing it from being renamed/updated.

## ✅ Solution 1: Use the Fix Script (Easiest)

Double-click `fix-prisma-lock.bat` or run:
```bash
fix-prisma-lock.bat
```

This will:
1. Kill all Node processes
2. Delete locked files
3. Generate Prisma clients

---

## ✅ Solution 2: Manual Fix (If Script Doesn't Work)

### Step 1: Close Everything
- Close ALL terminals
- Close VS Code/Cursor (or at least close the project)
- Close any running Node processes

### Step 2: Delete Locked Files
Open Command Prompt as **Administrator** and run:
```cmd
cd D:\ticketing_system
taskkill /F /IM node.exe
del /F /Q "node_modules\.prisma\client\query_engine-windows.dll.node"
del /F /Q "node_modules\.prisma\client\query_engine-windows.dll.node.tmp*"
```

### Step 3: Generate Prisma Clients
```cmd
cd backend\auth-service
npx prisma generate
cd ..\project-service
npx prisma generate
cd ..\..
```

---

## ✅ Solution 3: Generate in Each Service (Recommended)

Instead of using the root script, generate directly in each service:

```bash
# Terminal 1
cd backend/auth-service
npx prisma generate

# Terminal 2 (or same terminal after first completes)
cd backend/project-service
npx prisma generate
```

Or use the manual script:
```bash
npm run prisma:generate:manual
```

---

## ✅ Solution 4: Disable Antivirus Temporarily

Sometimes Windows Defender or antivirus locks the file:

1. Open Windows Defender
2. Add exclusion for: `D:\ticketing_system\node_modules\.prisma`
3. Try generating again

---

## ✅ Solution 5: Restart Computer

If nothing else works:
1. Save your work
2. Restart your computer
3. Run `npm run prisma:generate` immediately after restart

---

## 🎯 Quick Test

After fixing, verify it worked:
```bash
npm run dev:all
```

If you see Prisma errors, the generation didn't work. Try another solution above.

---

## 💡 Why This Happens

- Windows file locking is strict
- Prisma tries to rename a `.tmp` file to `.node`
- If any process has the file open, Windows blocks the rename
- Antivirus can also lock files during scanning

---

## ✅ Once Fixed

After Prisma clients are generated, you can start the app normally:
```bash
npm run dev:all
```

The Prisma generation only needs to be done:
- First time setup
- After pulling new code with schema changes
- After `npm install` if Prisma was updated

