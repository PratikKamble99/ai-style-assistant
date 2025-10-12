#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Regenerating Prisma client...');

try {
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated successfully!');
  
  console.log('🧪 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
  
  console.log('\n🎉 Prisma client is ready!');
  console.log('🚀 You can now run: npm run dev');
  
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
  console.log('\n🔍 Troubleshooting steps:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check DATABASE_URL in .env file');
  console.log('3. Run: npx prisma db push');
  console.log('4. Run: npx prisma generate');
  process.exit(1);
}