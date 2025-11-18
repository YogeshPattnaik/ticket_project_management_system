# 🚀 How to Start the Application

## Quick Start (All Services)

Start all services at once:

```bash
npm run dev:all
```

This will start:
- ✅ All backend services (auth, project, notification, migration)
- ✅ All frontend services (shell-app, auth-mfe, workspace-mfe, analytics-mfe, admin-mfe)

## Individual Service Commands

### Start Backend Services Only

```bash
# Start all backend services
npm run dev:backend

# Or start individually:
npm run dev:auth          # Auth service (port 3001)
npm run dev:project       # Project service (port 3002)
npm run dev:notification  # Notification service (port 3003)
npm run dev:migration     # Migration service (port 3004)
```

### Start Frontend Services Only

```bash
# Start all frontend services
npm run dev:frontend

# Or start individually:
npm run dev:shell         # Shell app (port 3000)
npm run dev:auth-mfe      # Auth MFE (port 3001 - dev)
npm run dev:workspace-mfe # Workspace MFE (port 3002 - dev)
npm run dev:analytics-mfe # Analytics MFE (port 3003 - dev)
npm run dev:admin-mfe     # Admin MFE (port 3004 - dev)
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Shell App | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Project Service | 3002 | http://localhost:3002 |
| Notification Service | 3003 | http://localhost:3003 |
| Migration Service | 3004 | http://localhost:3004 |
| Auth MFE (dev) | 3001 | http://localhost:3001 |
| Workspace MFE (dev) | 3002 | http://localhost:3002 |
| Analytics MFE (dev) | 3003 | http://localhost:3003 |
| Admin MFE (dev) | 3004 | http://localhost:3004 |

## Step-by-Step First Time Setup

### 1. Install Dependencies (if not done)

```bash
npm install
```

### 2. Create .env Files (if not done)

```bash
npm run setup:env
```

### 3. Configure Database Connections

Update `.env` files with your database connection strings:
- PostgreSQL: `backend/auth-service/.env`, `backend/project-service/.env`, `backend/migration-service/.env`
- MongoDB: `backend/notification-service/.env`, `backend/migration-service/.env`

### 4. Generate JWT Secrets (if not done)

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `backend/auth-service/.env` with these values.

### 5. Start the Application

```bash
npm run dev:all
```

## Access the Application

Once started, open your browser:

- **Main Application**: http://localhost:3000
- **Auth Service API**: http://localhost:3001/api/v1
- **Project Service API**: http://localhost:3002/api/v1
- **Notification Service API**: http://localhost:3003/api/v1
- **Migration Service API**: http://localhost:3004/api/v1

## API Documentation (Swagger)

- **Auth Service**: http://localhost:3001/api/docs
- **Project Service**: http://localhost:3002/api/docs
- **Migration Service**: http://localhost:3004/api/docs

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

```bash
# Windows - Find process using port
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Database Connection Errors

1. Check `.env` files have correct connection strings
2. Verify databases are running (Supabase, MongoDB Atlas)
3. Check network access (MongoDB: ensure 0.0.0.0/0 is allowed)

### Services Not Starting

1. Check if dependencies are installed: `npm install`
2. Verify Node.js version: `node --version` (should be >= 18)
3. Check for errors in terminal output
4. Ensure database connections are configured

## Development Workflow

### Recommended Development Setup

1. **Terminal 1**: Start backend services
   ```bash
   npm run dev:backend
   ```

2. **Terminal 2**: Start frontend services
   ```bash
   npm run dev:frontend
   ```

3. **Terminal 3**: Run migrations (if needed)
   ```bash
   npm run dev:migration
   ```

### Hot Reload

All services support hot reload:
- Backend: Changes auto-restart services
- Frontend: Changes auto-refresh browser

## Stopping Services

Press `Ctrl + C` in the terminal where services are running.

To stop all services:
```bash
# If using npm run dev:all, press Ctrl+C once
# If running in separate terminals, press Ctrl+C in each
```

## Production Build

To build for production:

```bash
# Build all services
npm run build:all

# Start production servers
# Each service has its own start command
cd backend/auth-service && npm run start:prod
cd backend/project-service && npm run start:prod
# etc.
```

## Quick Reference

```bash
# Setup
npm install              # Install dependencies
npm run setup:env        # Create .env files

# Development
npm run dev:all          # Start everything
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Individual Services
npm run dev:auth         # Auth service
npm run dev:project      # Project service
npm run dev:shell        # Shell app

# Database Updates
npm run update:postgres  # Update PostgreSQL URI
npm run update:mongo     # Update MongoDB URI

# Build
npm run build:all        # Build all services
```

## Need Help?

- Check logs in terminal for errors
- Verify database connections
- Ensure all `.env` files are configured
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

---

**Happy Coding! 🎉**

