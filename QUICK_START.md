# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- All dependencies installed (`npm install`)

## Step 1: Generate Prisma Clients (First Time Only)
```bash
npm run prisma:generate
```

## Step 2: Stop Any Running Processes
If you see port conflicts, stop all Node.js processes:
```bash
# Windows
taskkill /F /IM node.exe

# Or use the cleanup script
start-clean.bat
```

## Step 3: Start the Application

### Option A: Start Everything (Recommended)
```bash
npm run dev:all
```

### Option B: Start Backend Only
```bash
npm run dev:backend
```

### Option C: Start Frontend Only
```bash
npm run dev:frontend
```

### Option D: Start Individual Services
```bash
# Backend Services
npm run dev:auth          # Auth Service (port 3001)
npm run dev:project       # Project Service (port 3002)
npm run dev:notification # Notification Service (port 3003)
npm run dev:migration    # Migration Service (port 3004)

# Frontend Applications
npm run dev:shell        # Shell App (port 3000)
npm run dev:auth-mfe    # Auth MFE (port 3001)
npm run dev:workspace-mfe # Workspace MFE (port 3002)
npm run dev:analytics-mfe # Analytics MFE (port 3003)
npm run dev:admin-mfe    # Admin MFE (port 3004)
```

## Step 4: Access the Application

Once started, open your browser:
- **Main Application**: http://localhost:3000
- **Shell Dashboard**: http://localhost:3000/dashboard

The shell app will load all microfrontends in tabs.

## Troubleshooting

### Port Already in Use
```bash
# Windows - Kill all Node processes
taskkill /F /IM node.exe

# Then restart
npm run dev:all
```

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Dependencies Not Installed
```bash
npm install
```

### Database Connection Issues
1. Check your `.env` files in each service
2. Verify database URLs are correct
3. Make sure Supabase/MongoDB Atlas databases are active (not paused)

## What's Running?

When you run `npm run dev:all`, you'll see:
- **Backend Services** (4 services):
  - Auth Service
  - Project Service  
  - Notification Service
  - Migration Service

- **Frontend Applications** (5 apps):
  - Shell App (main entry point)
  - Auth MFE
  - Workspace MFE
  - Analytics MFE
  - Admin MFE

All services will show their ports in the terminal output.
