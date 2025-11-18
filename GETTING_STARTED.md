# 🚀 Getting Started - For New Developers

This guide is for developers who just cloned this repository and want to get the project running.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **Git** installed
- A code editor (VS Code, Cursor, etc.)

## 🔧 Step-by-Step Setup

### Step 1: Clone the Repository

If you haven't already:

```bash
git clone <repository-url>
cd ticketing_system
```

### Step 2: Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

**Note:** This may take a few minutes as it installs dependencies for all services and frontend apps.

### Step 3: Set Up Environment Variables

Create `.env` files for all services:

```bash
npm run setup:env
```

This creates `.env` files in:
- `backend/auth-service/.env`
- `backend/project-service/.env`
- `backend/migration-service/.env`
- `backend/notification-service/.env`

### Step 4: Configure Database Connections

You need to set up databases. You have two options:

#### Option A: Free Cloud Databases (Recommended - No Credit Card)

1. **PostgreSQL (Supabase)** - FREE forever
   - Go to https://supabase.com
   - Create a new project
   - Copy the connection string from Settings → Database
   - Update these files:
     - `backend/auth-service/.env` → `POSTGRES_URL`
     - `backend/project-service/.env` → `POSTGRES_URL`
     - `backend/migration-service/.env` → `POSTGRES_URL`

2. **MongoDB (MongoDB Atlas)** - FREE forever
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string from "Connect" → "Connect your application"
   - Update:
     - `backend/notification-service/.env` → `MONGODB_URI`
     - `backend/migration-service/.env` → `MONGODB_URI`

3. **Redis (Upstash - Optional)** - FREE forever
   - Go to https://upstash.com
   - Create a database
   - Copy the REST URL
   - Update `backend/notification-service/.env` → `REDIS_URL` (optional)

#### Option B: Local Docker (Requires Docker Desktop)

```bash
# Start local databases
docker-compose up -d

# The .env files will automatically use local database URLs
```

### Step 5: Generate JWT Secrets

Generate secrets for authentication:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the outputs and add them to `backend/auth-service/.env`:
```
JWT_SECRET=<paste-first-output>
JWT_REFRESH_SECRET=<paste-second-output>
```

### Step 6: Generate Prisma Clients

Generate Prisma clients for database access:

```bash
npm run prisma:generate
```

**Important:** If you get permission errors on Windows:
1. Close all terminals and editors
2. Open Task Manager and kill all `node.exe` processes
3. Delete: `rmdir /S /Q node_modules\.prisma\client`
4. Run `npm run prisma:generate` again

### Step 7: Start the Application

Start all services:

```bash
npm run dev:all
```

This starts:
- ✅ 4 Backend services (auth, project, notification, migration)
- ✅ 5 Frontend apps (shell-app, auth-mfe, workspace-mfe, analytics-mfe, admin-mfe)

### Step 8: Access the Application

Open your browser:

- **Main Application**: http://localhost:3000
- **API Documentation**:
  - Auth Service: http://localhost:3001/api/docs
  - Project Service: http://localhost:3002/api/docs
  - Migration Service: http://localhost:3004/api/docs

## 🎯 Quick Commands Reference

```bash
# Setup (First Time)
npm install                    # Install dependencies
npm run setup:env              # Create .env files
npm run prisma:generate        # Generate Prisma clients

# Development
npm run dev:all                # Start everything
npm run dev:backend            # Backend only
npm run dev:frontend           # Frontend only

# Individual Services
npm run dev:auth               # Auth service
npm run dev:project            # Project service
npm run dev:shell              # Shell app

# Troubleshooting
taskkill /F /IM node.exe       # Kill all Node processes (Windows)
npm run prisma:generate        # Regenerate Prisma clients
```

## 🐛 Common Issues & Solutions

### Issue: "Port already in use"

**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# Then restart
npm run dev:all
```

### Issue: "Prisma Client not found"

**Solution:**
```bash
npm run prisma:generate
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma clients
npm run prisma:generate
```

### Issue: "Database connection failed"

**Solution:**
1. Check `.env` files have correct connection strings
2. Verify databases are running (Supabase/MongoDB Atlas)
3. For MongoDB: Ensure network access allows `0.0.0.0/0`
4. For Supabase: Check if database is paused (unpause it)

### Issue: "EPERM: operation not permitted" (Windows)

**Solution:**
1. Close ALL terminals, VS Code, and Cursor
2. Open Task Manager → Kill all `node.exe` processes
3. Delete: `rmdir /S /Q node_modules\.prisma\client`
4. Run: `npm run prisma:generate`

## 📁 Project Structure

```
ticketing_system/
├── backend/
│   ├── auth-service/          # Authentication & Authorization
│   ├── project-service/        # Projects & Tasks
│   ├── notification-service/   # Real-time Notifications
│   └── migration-service/      # Database Migrations
├── frontend/
│   ├── shell-app/              # Main Container App
│   ├── auth-mfe/               # Auth Microfrontend
│   ├── workspace-mfe/          # Workspace Microfrontend
│   ├── analytics-mfe/          # Analytics Microfrontend
│   ├── admin-mfe/              # Admin Microfrontend
│   └── shared-ui/              # Shared Components
└── shared-libs/                # Shared Libraries
```

## 🔗 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Shell App | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001/api |
| Project Service | 3002 | http://localhost:3002/api |
| Notification Service | 3003 | http://localhost:3003/api |
| Migration Service | 3004 | http://localhost:3004/api |

## 📚 Additional Documentation

- **Quick Start**: See `QUICK_START.md` for faster setup
- **Project Details**: See `PROJECT_DETAILS.md` for architecture
- **Development Guide**: See `DEVELOPMENT_GUIDE.md` for workflows
- **Free Setup**: See `FREE_TIER_SETUP_GUIDE.md` for cloud database setup

## ✅ Success Checklist

After following this guide, you should have:

- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Databases connected (Supabase + MongoDB Atlas)
- ✅ Prisma clients generated
- ✅ All services running
- ✅ Application accessible at http://localhost:3000

## 🆘 Still Having Issues?

1. Check terminal output for specific error messages
2. Verify all `.env` files are configured correctly
3. Ensure databases are active (not paused)
4. Try killing all Node processes and starting fresh
5. Check Node.js version: `node --version` (should be >= 18)

---

**Happy Coding! 🎉**

