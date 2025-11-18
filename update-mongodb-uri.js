#!/usr/bin/env node

/**
 * Script to update MongoDB connection string in all .env files
 * Usage: node update-mongodb-uri.js "your-connection-string"
 */

const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.argv[2] || 'mongodb+srv://task_mongo_db:YogiAdmin9868@cluster0.3iznolp.mongodb.net/?appName=Cluster0';

// Add database name if not present
let mongoUri = MONGODB_URI;
if (!mongoUri.includes('/task_management') && !mongoUri.match(/\/[^?\/]+(\?|$)/)) {
  // Insert database name before query parameters
  if (mongoUri.includes('?')) {
    mongoUri = mongoUri.replace('?', '/task_management?');
  } else {
    mongoUri = mongoUri + '/task_management';
  }
}
// Fix double slashes
mongoUri = mongoUri.replace(/\/+/g, '/').replace(':/', '://');

const files = [
  'backend/notification-service/.env',
  'backend/migration-service/.env'
];

console.log('🔄 Updating MongoDB connection strings...\n');

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} not found. Skipping...`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update MONGODB_URL line
    content = content.replace(
      /MONGODB_URL=.*/g,
      `MONGODB_URL=${mongoUri}`
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n✨ MongoDB connection strings updated successfully!');
console.log(`📝 Connection string: ${mongoUri}\n`);

