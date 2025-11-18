#!/usr/bin/env node

/**
 * Script to update both PostgreSQL and MongoDB connection strings
 * Usage: 
 *   node update-all-databases.js --postgres "postgres-uri" --mongo "mongo-uri"
 * Or update individually using update-postgres-uri.js and update-mongodb-uri.js
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let postgresUri = null;
let mongoUri = null;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--postgres' && args[i + 1]) {
    postgresUri = args[i + 1];
    i++;
  } else if (args[i] === '--mongo' && args[i + 1]) {
    mongoUri = args[i + 1];
    i++;
  }
}

if (postgresUri) {
  console.log('🔄 Updating PostgreSQL connection strings...\n');
  const postgresFiles = [
    'backend/auth-service/.env',
    'backend/project-service/.env',
    'backend/migration-service/.env'
  ];

  postgresFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/POSTGRES_URL=.*/g, `POSTGRES_URL=${postgresUri}`);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
      }
    }
  });
}

if (mongoUri) {
  console.log('\n🔄 Updating MongoDB connection strings...\n');
  
  // Add database name if not present
  let mongoUriWithDb = mongoUri;
  if (!mongoUriWithDb.includes('/task_management')) {
    if (mongoUriWithDb.includes('?')) {
      mongoUriWithDb = mongoUriWithDb.replace('?', '/task_management?');
    } else {
      mongoUriWithDb = mongoUriWithDb + '/task_management';
    }
  }

  const mongoFiles = [
    'backend/notification-service/.env',
    'backend/migration-service/.env'
  ];

  mongoFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/MONGODB_URL=.*/g, `MONGODB_URL=${mongoUriWithDb}`);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
      }
    }
  });
}

if (postgresUri || mongoUri) {
  console.log('\n✨ Database connection strings updated successfully!\n');
} else {
  console.log('Usage: node update-all-databases.js --postgres "uri" --mongo "uri"');
}

