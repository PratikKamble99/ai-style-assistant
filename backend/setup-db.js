#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up database...');

try {
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate dev --name add_seasonal_trends_and_photo_analysis', { stdio: 'inherit' });

  console.log('🌱 Seeding database...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}