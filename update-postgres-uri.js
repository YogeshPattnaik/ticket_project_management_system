#!/usr/bin/env node

/**
 * Script to update PostgreSQL connection string in all .env files
 * Usage: node update-postgres-uri.js "your-connection-string"
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URI = process.argv[2] || 'postgresql://postgres:YogiAdmin9868@db.lajudvjfcitkebbubash.supabase.co:5432/postgres';

const files = [
  'backend/auth-service/.env',
  'backend/project-service/.env',
  'backend/migration-service/.env'
];

console.log('🔄 Updating PostgreSQL connection strings...\n');

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} not found. Skipping...`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update POSTGRES_URL line
    content = content.replace(
      /POSTGRES_URL=.*/g,
      `POSTGRES_URL=${SUPABASE_URI}`
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n✨ PostgreSQL connection strings updated successfully!');
console.log(`📝 Connection string: ${SUPABASE_URI}\n`);

