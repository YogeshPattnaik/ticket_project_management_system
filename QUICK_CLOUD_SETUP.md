# Quick Cloud Database Setup (5 Minutes) - 🆓 100% Free

**No credit card required! All services are free forever.**

## 🚀 Fast Track Setup

Follow these steps in order:

### 1. PostgreSQL (Supabase) - 2 minutes

1. Go to: https://supabase.com → Sign up
2. Click "New Project"
3. Name: `task-management`
4. Create password (save it!)
5. Wait 2 minutes
6. Go to: **Settings** → **Database**
7. Copy connection string (URI tab)
8. Replace `[YOUR-PASSWORD]` with your password

**Example:**
```
postgresql://postgres:MyPass123@db.abcdef.supabase.co:5432/postgres
```

### 2. MongoDB (Atlas) - 3 minutes

1. Go to: https://www.mongodb.com/cloud/atlas → Sign up
2. Create project: `Task Management`
3. Build Database → **FREE** tier
4. Create database user (save username & password!)
5. Network Access → Add IP → **Allow from anywhere** (0.0.0.0/0)
6. Connect → Connect your application
7. Copy connection string
8. Replace `<username>` and `<password>`
9. Add `/task_management` before `?retryWrites`

**Example:**
```
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
```

### 3. Update .env Files

Open these files and replace placeholders:

**backend/auth-service/.env**
```env
POSTGRES_URL=your-supabase-connection-string-here
JWT_SECRET=generate-random-string-here
JWT_REFRESH_SECRET=generate-random-string-here
```

**backend/project-service/.env**
```env
POSTGRES_URL=your-supabase-connection-string-here
```

**backend/notification-service/.env**
```env
MONGODB_URL=your-mongodb-connection-string-here
```

**backend/migration-service/.env**
```env
POSTGRES_URL=your-supabase-connection-string-here
MONGODB_URL=your-mongodb-connection-string-here
```

### 4. Generate JWT Secrets

Run this command:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `backend/auth-service/.env`

### 5. Run Application

```bash
npm run dev:all
```

## ✅ Done!

Your application is now running with cloud databases!

**See full guide**: [CLOUD_DATABASE_SETUP_GUIDE.md](./CLOUD_DATABASE_SETUP_GUIDE.md)

