# 🔍 Checking Backend Services Status

## Quick Status Check

The backend services are starting in the background. Here's how to verify they're running:

### 1. Check Ports

```bash
netstat -ano | findstr "LISTENING" | findstr ":3001 :3002 :3003 :3004"
```

You should see:
- Port 3001 (Auth Service)
- Port 3002 (Project Service)  
- Port 3003 (Notification Service)
- Port 3004 (Migration Service)

### 2. Test API Endpoints

Open in your browser:
- **Auth Service**: http://localhost:3001/api/docs (Swagger)
- **Roles API**: http://localhost:3001/api/v1/roles (should return `[]` if no data)
- **Project Service**: http://localhost:3002/api/docs

### 3. Check Terminal Output

Look at the terminal where you ran `npm run dev:backend` for:
- ✅ "Auth service is running on port 3001"
- ✅ "Project service is running on port 3002"
- ❌ Any error messages

## Common Issues

### Services Not Starting

1. **Missing .env files**
   - Check: `backend/auth-service/.env`
   - Check: `backend/project-service/.env`
   - Check: `backend/notification-service/.env`
   - Check: `backend/migration-service/.env`

2. **Database Connection Errors**
   - Verify Supabase PostgreSQL URL is correct
   - Verify MongoDB Atlas URL is correct
   - Check network connectivity

3. **Missing Dependencies**
   ```bash
   npm install
   ```

4. **Port Conflicts**
   - Make sure ports 3001-3004 are not in use by other applications

### If Services Don't Start

Try starting individually to see specific errors:

```bash
# Terminal 1 - Auth Service
cd backend/auth-service
npm run start:dev

# Terminal 2 - Project Service  
cd backend/project-service
npm run start:dev

# Terminal 3 - Notification Service
cd backend/notification-service
npm run start:dev

# Terminal 4 - Migration Service
cd backend/migration-service
npm run start:dev
```

This will show you exactly which service has issues and what the error is.

## Expected Behavior

Once services are running:
- ✅ Frontend can connect to APIs
- ✅ You'll get `[]` (empty arrays) if no data exists
- ✅ You can create new data via the UI
- ✅ No more `ERR_CONNECTION_REFUSED` errors


