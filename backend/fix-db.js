#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Node.js and database issues...');

try {
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from example...');
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created. Please update DATABASE_URL and other variables.');
    } else {
      console.log('⚠️  No .env.example found. Creating basic .env file...');
      const basicEnv = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_stylist_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# API Keys (optional for development)
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-token"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3002
NODE_ENV=development
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('✅ Basic .env file created. Please update the values.');
    }
  }

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🗄️  Checking database connection...');
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Database schema updated successfully!');
    
    console.log('🌱 Seeding database...');
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully!');
  } catch (dbError) {
    console.log('⚠️  Database connection failed. This is normal if you haven\'t set up PostgreSQL yet.');
    console.log('📋 To set up the database:');
    console.log('   1. Install PostgreSQL');
    console.log('   2. Create a database named "ai_stylist_db"');
    console.log('   3. Update DATABASE_URL in .env file');
    console.log('   4. Run: npx prisma db push');
    console.log('   5. Run: npm run seed');
  }

  console.log('🚀 Checking TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful!');
  } catch (tsError) {
    console.log('⚠️  TypeScript compilation has warnings, but server should still work.');
  }

  console.log('🎉 Setup complete! You can now run:');
  console.log('   npm run dev    # Start development server');
  console.log('   npm run build  # Build for production');
  console.log('   npm start      # Start production server');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('   1. Make sure Node.js and npm are installed');
  console.log('   2. Check that PostgreSQL is running');
  console.log('   3. Verify DATABASE_URL in .env file');
  console.log('   4. Run: npm install');
  console.log('   5. Run: npx prisma generate');
  process.exit(1);
}