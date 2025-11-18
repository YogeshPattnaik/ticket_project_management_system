# 🎯 START HERE - Get Your Project Running!

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies (If Not Done)
```bash
npm install
```

### Step 2: Generate Prisma Clients (First Time Only)
```bash
npm run prisma:generate
```

### Step 3: Start Everything
```bash
npm run dev:all
```

**That's it!** Open http://localhost:3000 in your browser.

---

## 🛠️ If You Get Errors

### Error: "Port already in use"
**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# Then restart
npm run dev:all
```

### Error: "Prisma Client not found"
**Solution:**
```bash
npm run prisma:generate
```

### Error: "cross-env not found" or "command not recognized"
**Solution:** Already fixed! Just run:
```bash
npm run dev:all
```

### Error: "Cannot find module" or "Module not found"
**Solution:**
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma clients
npm run prisma:generate
```

---

## 📍 What Ports Are Used?

| Service | Port | URL |
|---------|------|-----|
| Shell App (Main) | 3000 | http://localhost:3000 |
| Auth MFE | 3001 | http://localhost:3001 |
| Workspace MFE | 3002 | http://localhost:3002 |
| Analytics MFE | 3003 | http://localhost:3003 |
| Admin MFE | 3004 | http://localhost:3004 |
| Auth Service (Backend) | 3001 | http://localhost:3001/api |
| Project Service (Backend) | 3002 | http://localhost:3002/api |
| Notification Service (Backend) | 3003 | http://localhost:3003/api |
| Migration Service (Backend) | 3004 | http://localhost:3004/api |

**Note:** Frontend and backend services share ports. This is fine for development.

---

## 🎮 Alternative: Start Services Individually

If `npm run dev:all` doesn't work, try starting services one by one:

### Terminal 1: Backend Services
```bash
npm run dev:backend
```

### Terminal 2: Frontend Services  
```bash
npm run dev:frontend
```

---

## ✅ Success Indicators

When everything is running, you should see:
- ✅ Multiple "ready" messages in terminal
- ✅ No red error messages
- ✅ Port numbers listed (3000, 3001, 3002, etc.)
- ✅ Browser opens to http://localhost:3000

---

## 🆘 Still Having Issues?

1. **Kill all Node processes:**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Clean install:**
   ```bash
   npm install
   npm run prisma:generate
   ```

3. **Start fresh:**
   ```bash
   npm run dev:all
   ```

4. **Check the terminal output** - it will show you exactly which service failed and why.

---

## 📝 What's Running?

When you run `npm run dev:all`, you start:
- **4 Backend Services** (NestJS/Express)
- **5 Frontend Apps** (Next.js/React)

All services run concurrently and show their status in the terminal.

---

**Need more help?** Check `QUICK_START.md` for detailed instructions.


