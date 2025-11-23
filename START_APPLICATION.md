# How to Start the Application

## Quick Start (All Services)

From the **root directory** (`D:\ticketing_system`):

```bash
# Start all frontend services (shell app + all MFEs)
npm run dev:frontend
```

This will start:
- **Shell App** on `http://localhost:3000` (main application)
- **Auth MFE** on `http://localhost:3001`
- **Workspace MFE** on `http://localhost:3002`
- **Analytics MFE** on `http://localhost:3003`
- **Admin MFE** on `http://localhost:3004`

## Option 2: Start Individually (For Debugging)

If you need to see logs separately or debug specific services, open **5 separate terminal windows**:

### Terminal 1 - Shell App
```bash
cd frontend/shell-app
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2 - Auth MFE
```bash
cd frontend/auth-mfe
npm run dev
# Runs on http://localhost:3001
```

### Terminal 3 - Workspace MFE
```bash
cd frontend/workspace-mfe
npm run dev
# Runs on http://localhost:3002
```

### Terminal 4 - Analytics MFE
```bash
cd frontend/analytics-mfe
npm run dev
# Runs on http://localhost:3003
```

### Terminal 5 - Admin MFE
```bash
cd frontend/admin-mfe
npm run dev
# Runs on http://localhost:3004
```

## Access the Application

Once all services are running:

1. **Open your browser** and go to: `http://localhost:3000`
2. **Navigate to different routes:**
   - `/` - Home page
   - `/auth/login` - Authentication (Auth MFE)
   - `/auth/register` - Registration (Auth MFE)
   - `/dashboard` - Workspace Dashboard (Workspace MFE)
   - `/dashboard?mfe=admin` - Admin Dashboard (Admin MFE)
   - `/dashboard?mfe=analytics` - Analytics Dashboard (Analytics MFE)

## Important Notes

- **All MFEs must be running** for the application to work properly
- The shell app (port 3000) loads MFEs from their individual ports
- Single-spa automatically handles mounting/unmounting based on routes
- Hot Module Replacement (HMR) works independently for each MFE

## Troubleshooting

If you see errors:

1. **Check all services are running** - You need all 5 services (shell + 4 MFEs)
2. **Check console logs** - Each service logs to its own terminal
3. **Hard refresh browser** - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. **Check ports are not in use** - Make sure ports 3000-3004 are available

## First Time Setup

If you haven't installed dependencies yet:

```bash
# From root directory
npm install

# Or install individually
cd frontend/shell-app && npm install
cd ../auth-mfe && npm install
cd ../workspace-mfe && npm install
cd ../analytics-mfe && npm install
cd ../admin-mfe && npm install
```

