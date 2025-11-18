#!/usr/bin/env node

/**
 * Script to generate Prisma clients for all services that use Prisma
 * IMPORTANT: Close all terminals and editors before running this!
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const services = [
  'backend/auth-service',
  'backend/project-service',
];

console.log('🔧 Generating Prisma clients for all services...\n');
console.log('⚠️  Make sure all Node.js processes are stopped!\n');

// Clean up locked Prisma files
function cleanupPrismaFiles() {
  const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  
  if (!fs.existsSync(prismaClientPath)) {
    return;
  }

  console.log('🧹 Cleaning up Prisma files...');
  
  try {
    const files = fs.readdirSync(prismaClientPath);
    let cleaned = 0;
    
    files.forEach((file) => {
      if (file.includes('query_engine') && (file.endsWith('.node') || file.endsWith('.tmp'))) {
        const filePath = path.join(prismaClientPath, file);
        try {
          fs.unlinkSync(filePath);
          cleaned++;
        } catch (e) {
          // File is locked - user needs to close processes
        }
      }
    });
    
    if (cleaned > 0) {
      console.log(`✅ Cleaned up ${cleaned} file(s)\n`);
    }
  } catch (error) {
    // Ignore
  }
}

// Clean up first
cleanupPrismaFiles();

// Generate Prisma clients
let allSuccess = true;

services.forEach((servicePath) => {
  const fullPath = path.join(__dirname, servicePath);
  const prismaPath = path.join(fullPath, 'prisma');
  const schemaPath = path.join(prismaPath, 'schema.prisma');

  if (fs.existsSync(schemaPath)) {
    console.log(`📦 Generating Prisma client for ${servicePath}...`);
    try {
      execSync('npx prisma generate', {
        cwd: fullPath,
        stdio: 'inherit',
      });
      console.log(`✅ Successfully generated Prisma client for ${servicePath}\n`);
    } catch (error) {
      console.error(`❌ Failed to generate Prisma client for ${servicePath}`);
      console.error(`   Error: ${error.message}\n`);
      
      if (error.message.includes('EPERM') || error.message.includes('operation not permitted')) {
        console.error('💡 PERMISSION ERROR DETECTED!');
        console.error('\n   Follow these steps:');
        console.error('   1. Close ALL terminals, VS Code, and Cursor');
        console.error('   2. Open Task Manager (Ctrl+Shift+Esc)');
        console.error('   3. Kill ALL "node.exe" processes');
        console.error('   4. Delete this folder: node_modules\\.prisma\\client');
        console.error('   5. Open a NEW terminal');
        console.error('   6. Run: npm run prisma:generate');
        console.error('\n   OR use: fix-prisma-permissions.bat\n');
      }
      
      allSuccess = false;
    }
  } else {
    console.log(`⏭️  Skipping ${servicePath} (no Prisma schema found)\n`);
  }
});

if (allSuccess) {
  console.log('✨ All Prisma clients generated successfully!');
  process.exit(0);
} else {
  console.error('\n❌ Some Prisma clients failed to generate');
  console.error('   See FIX_PRISMA.md for detailed instructions');
  process.exit(1);
}
