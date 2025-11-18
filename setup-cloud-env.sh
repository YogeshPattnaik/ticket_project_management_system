#!/bin/bash

# Cloud Database Environment Setup Script
# This script helps you set up .env files for cloud databases

echo "🚀 Cloud Database Setup for Task Management System"
echo "=================================================="
echo ""

# Check if .env files exist
if [ ! -f "backend/auth-service/.env" ]; then
    echo "Creating backend/auth-service/.env..."
    cat > backend/auth-service/.env << EOF
PORT=3001
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_URL:5432/postgres
JWT_SECRET=your-secret-key-change-in-production-$(openssl rand -hex 32)
JWT_REFRESH_SECRET=your-refresh-secret-key-$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created backend/auth-service/.env"
    echo "⚠️  Please update POSTGRES_URL with your Supabase connection string"
fi

if [ ! -f "backend/project-service/.env" ]; then
    echo "Creating backend/project-service/.env..."
    cat > backend/project-service/.env << EOF
PORT=3002
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_URL:5432/postgres
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created backend/project-service/.env"
    echo "⚠️  Please update POSTGRES_URL with your Supabase connection string"
fi

if [ ! -f "backend/notification-service/.env" ]; then
    echo "Creating backend/notification-service/.env..."
    cat > backend/notification-service/.env << EOF
PORT=3003
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_DB_NAME=task_management
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created backend/notification-service/.env"
    echo "⚠️  Please update MONGODB_URL with your MongoDB Atlas connection string"
fi

if [ ! -f "backend/migration-service/.env" ]; then
    echo "Creating backend/migration-service/.env..."
    cat > backend/migration-service/.env << EOF
PORT=3004
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_URL:5432/postgres
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_DB_NAME=task_management
ALLOWED_ORIGINS=http://localhost:3000
EOF
    echo "✅ Created backend/migration-service/.env"
    echo "⚠️  Please update database URLs"
fi

if [ ! -f "frontend/shell-app/.env.local" ]; then
    echo "Creating frontend/shell-app/.env.local..."
    cat > frontend/shell-app/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:3003
EOF
    echo "✅ Created frontend/shell-app/.env.local"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up cloud databases (see CLOUD_DATABASE_SETUP.md)"
echo "2. Update .env files with your database connection strings"
echo "3. Run: npm run dev:all"
echo ""

