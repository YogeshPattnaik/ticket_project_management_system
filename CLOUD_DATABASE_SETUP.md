# Cloud Database Setup Guide

This guide shows how to set up the application using cloud databases instead of local Docker.

## Option 1: Free Cloud Databases (Recommended)

### PostgreSQL - Supabase (Free Tier)

1. Go to https://supabase.com
2. Sign up and create a new project
3. Get your connection string from Settings → Database
4. Update `backend/auth-service/.env`:
   ```env
   POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### MongoDB - MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up and create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string: Connect → Connect your application
6. Update `backend/notification-service/.env`:
   ```env
   MONGODB_URL=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/task_management?retryWrites=true&w=majority
   ```

### Redis - Upstash (Free Tier)

1. Go to https://upstash.com
2. Sign up and create a Redis database
3. Get connection details from dashboard
4. Update services that need Redis:
   ```env
   REDIS_URL=redis://[USERNAME]:[PASSWORD]@[ENDPOINT]:[PORT]
   ```

## Option 2: Alternative Cloud Services

### PostgreSQL Alternatives:
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Railway** (https://railway.app) - Easy PostgreSQL setup
- **Render** (https://render.com) - Free PostgreSQL tier

### MongoDB Alternatives:
- **MongoDB Atlas** (recommended) - Free 512MB cluster
- **Railway** - MongoDB hosting

### Redis Alternatives:
- **Upstash** (recommended) - Free tier with 10K commands/day
- **Redis Cloud** (https://redis.com/cloud) - Free tier
- **Railway** - Redis hosting

## Quick Setup Script

After setting up cloud databases, create `.env` files:

### backend/auth-service/.env
```env
PORT=3001
POSTGRES_URL=your-supabase-connection-string
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

### backend/project-service/.env
```env
PORT=3002
POSTGRES_URL=your-supabase-connection-string
ALLOWED_ORIGINS=http://localhost:3000
```

### backend/notification-service/.env
```env
PORT=3003
MONGODB_URL=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=task_management
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALLOWED_ORIGINS=http://localhost:3000
```

### backend/migration-service/.env
```env
PORT=3004
POSTGRES_URL=your-supabase-connection-string
MONGODB_URL=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=task_management
ALLOWED_ORIGINS=http://localhost:3000
```

## Running Without Docker

Once cloud databases are configured:

```bash
# Install dependencies (already done)
npm install

# Start backend services
npm run dev:auth
npm run dev:project
npm run dev:notification
npm run dev:migration

# Start frontend services
npm run dev:shell
npm run dev:auth-mfe
npm run dev:workspace-mfe
npm run dev:analytics-mfe
npm run dev:admin-mfe
```

## Benefits of Cloud Databases

✅ No Docker installation needed  
✅ Accessible from anywhere  
✅ Automatic backups  
✅ Easy scaling  
✅ Free tiers available  
✅ Production-ready  

## Migration from Docker

If you later want to use Docker:

1. Keep your cloud database URLs in `.env` files
2. Or update to local Docker database URLs
3. Run `npm run docker:up` to start local databases

