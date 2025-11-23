# 🚀 How to Start Your Application

## Quick Answer: Start Everything

From the **root directory** (`D:\ticketing_system`), run:

```bash
npm run dev:frontend
```

This starts **all 5 frontend services**:
- Shell App → `http://localhost:3000` ✅
- Auth MFE → `http://localhost:3001`
- Workspace MFE → `http://localhost:3002`
- Analytics MFE → `http://localhost:3003`
- Admin MFE → `http://localhost:3004`

Then open: **`http://localhost:3000`** in your browser.

---

## All Available Commands

### Start Frontend Only (Recommended)
```bash
npm run dev:frontend
```
Starts all 5 frontend services (shell + 4 MFEs)

### Start Everything (Frontend + Backend)
```bash
npm run dev:all
```
Starts all frontend services AND all backend services

### Start Frontend Services Individually

**Terminal 1:**
```bash
npm run dev:shell
# OR
cd frontend/shell-app && npm run dev
```

**Terminal 2:**
```bash
npm run dev:auth-mfe
# OR
cd frontend/auth-mfe && npm run dev
```

**Terminal 3:**
```bash
npm run dev:workspace-mfe
# OR
cd frontend/workspace-mfe && npm run dev
```

**Terminal 4:**
```bash
npm run dev:analytics-mfe
# OR
cd frontend/analytics-mfe && npm run dev
```

**Terminal 5:**
```bash
npm run dev:admin-mfe
# OR
cd frontend/admin-mfe && npm run dev
```

---

## ⚠️ Important Notes

1. **All MFEs must be running** for the application to work
2. **Start order doesn't matter** - they can all start at once
3. **Wait for all services to start** - Look for "Local: http://localhost:XXXX" in each terminal
4. **Open browser after all services are running**

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "port already in use" error:
- Stop any other services using ports 3000-3004
- Or kill the process: `npx kill-port 3000 3001 3002 3003 3004`

### Server Won't Start
1. Check for errors in the terminal
2. Make sure dependencies are installed: `npm install`
3. Check if Node.js version is correct: `node --version` (should be >= 18)

### Browser Shows Nothing
1. Check browser console (F12) for errors
2. Make sure all 5 services are running
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## ✅ Quick Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] All 5 services running (check terminals)
- [ ] No port conflicts
- [ ] Browser opened to `http://localhost:3000`
- [ ] Check browser console for errors

---

## 🎯 Recommended Workflow

1. **Open terminal in root directory**
2. **Run:** `npm run dev:frontend`
3. **Wait for all services to start** (you'll see 5 "Local: http://localhost:XXXX" messages)
4. **Open browser:** `http://localhost:3000`
5. **Done!** 🎉

