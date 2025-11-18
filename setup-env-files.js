#!/usr/bin/env node

/**
 * Setup script to create .env files for cloud database configuration
 * Run: node setup-env-files.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate random secret
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

const files = [
  {
    path: 'backend/auth-service/.env',
    content: `# Server Configuration
PORT=3001

# Database - Replace with your Supabase connection string
# Format: postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# JWT Configuration - Auto-generated secrets (change in production!)
JWT_SECRET=${generateSecret()}
JWT_REFRESH_SECRET=${generateSecret()}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`
  },
  {
    path: 'backend/project-service/.env',
    content: `# Server Configuration
PORT=3002

# Database - Replace with your Supabase connection string
# Format: postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`
  },
  {
    path: 'backend/notification-service/.env',
    content: `# Server Configuration
PORT=3003

# MongoDB - Replace with your MongoDB Atlas connection string
# Format: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_DB_NAME=task_management

# Email Configuration (Optional - for email notifications)
# For Gmail: Generate App Password at https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`
  },
  {
    path: 'backend/migration-service/.env',
    content: `# Server Configuration
PORT=3004

# PostgreSQL - Replace with your Supabase connection string
# Format: postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# MongoDB - Replace with your MongoDB Atlas connection string
# Format: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_management?retryWrites=true&w=majority
MONGODB_DB_NAME=task_management

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`
  },
  {
    path: 'frontend/shell-app/.env.local',
    content: `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:3003
`
  }
];

console.log('🚀 Creating .env files for cloud database setup...\n');

files.forEach(({ path: filePath, content }) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} already exists. Skipping...`);
  } else {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Created ${filePath}`);
  }
});

console.log('\n✨ .env files created successfully!\n');
console.log('📝 Next steps:');
console.log('1. Set up cloud databases (see CLOUD_DATABASE_SETUP_GUIDE.md)');
console.log('2. Update .env files with your database connection strings');
console.log('3. Replace placeholders (YOUR_PASSWORD, YOUR_USERNAME, etc.)');
console.log('4. Run: npm run dev:all\n');

