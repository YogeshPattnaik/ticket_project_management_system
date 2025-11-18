# 🚀 Starting Backend Services

## The Issue

The `ERR_CONNECTION_REFUSED` error means the **backend services are not running**. This is not a database data issue - it's a service availability issue.

## Quick Fix: Start Backend Services

### Option 1: Start All Backend Services (Recommended)

```bash
npm run dev:backend
```

This starts:
- Auth Service (port 3001) - handles `/api/v1/roles`
- Project Service (port 3002)
- Notification Service (port 3003)
- Migration Service (port 3004)

### Option 2: Start Individual Services

```bash
# Start Auth Service (needed for roles API)
npm run dev:auth

# In separate terminals, start other services:
npm run dev:project
npm run dev:notification
npm run dev:migration
```

## What Changed

I've updated the API client to point to:
- **Auth Service**: `http://localhost:3001` (instead of port 8000)

## After Starting Services

Once the backend services are running:

1. **Check if services started successfully:**
   ```bash
   # Should show services listening on ports 3001, 3002, 3003, 3004
   netstat -ano | findstr ":3001 :3002 :3003 :3004"
   ```

2. **Test the API:**
   - Open: http://localhost:3001/api/v1/roles
   - Should return `[]` (empty array) if no data, or a proper error if service has issues

3. **Check Swagger Docs:**
   - Auth Service: http://localhost:3001/api/docs

## Understanding the Errors

- **`ERR_CONNECTION_REFUSED`** = Service not running ❌
- **`200 OK` with `[]`** = Service running, no data ✅
- **`404 Not Found`** = Service running, endpoint doesn't exist
- **`500 Internal Server Error`** = Service running, but has an error

## Database Connection

Even if your databases are empty, the services should still:
- Start successfully
- Return empty arrays for GET requests
- Allow you to create new data via POST requests

If you get database connection errors, check your `.env` files have the correct database URLs.

