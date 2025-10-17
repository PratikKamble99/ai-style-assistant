#!/usr/bin/env node

/**
 * Quick Fix Script for AI Stylist App
 * Fixes common issues and ensures everything is working
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 AI Stylist App - Quick Fix Script');
console.log('=' .repeat(50));

// Helper functions
const log = (message, color = 'reset') => {
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');

// Fix functions
function fixBackendEnv() {
  logInfo('Checking backend environment...');
  
  const backendPath = path.join(__dirname, 'backend');
  const envPath = path.join(backendPath, '.env');
  const envExamplePath = path.join(backendPath, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      logWarning('Created .env from .env.example - Please update with your actual values');
    } else {
      logError('.env.example not found - Please create environment file manually');
      return false;
    }
  }
  
  logSuccess('Backend environment file exists');
  return true;
}

function fixMobileAppConfig() {
  logInfo('Checking mobile app configuration...');
  
  const appJsonPath = path.join(__dirname, 'mobile-app', 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Remove sdkVersion if it exists (not needed in newer Expo versions)
    if (appJson.expo.sdkVersion) {
      delete appJson.expo.sdkVersion;
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      logSuccess('Removed deprecated sdkVersion from app.json');
    }
    
    logSuccess('Mobile app configuration is correct');
    return true;
  }
  
  logError('app.json not found');
  return false;
}

function installDependencies() {
  logInfo('Installing dependencies...');
  
  try {
    // Backend dependencies
    logInfo('Installing backend dependencies...');
    process.chdir(path.join(__dirname, 'backend'));
    execSync('npm install', { stdio: 'inherit' });
    
    // Mobile app dependencies
    logInfo('Installing mobile app dependencies...');
    process.chdir(path.join(__dirname, 'mobile-app'));
    execSync('npm install', { stdio: 'inherit' });
    
    // Return to root
    process.chdir(__dirname);
    
    logSuccess('All dependencies installed');
    return true;
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    return false;
  }
}

function checkDatabaseConnection() {
  logInfo('Checking database connection...');
  
  try {
    process.chdir(path.join(__dirname, 'backend'));
    execSync('npx prisma db push', { stdio: 'inherit' });
    logSuccess('Database schema is up to date');
    return true;
  } catch (error) {
    logWarning('Database connection failed - Please ensure PostgreSQL is running');
    logInfo('Run: brew services start postgresql (macOS) or sudo systemctl start postgresql (Linux)');
    return false;
  }
}

function generatePrismaClient() {
  logInfo('Generating Prisma client...');
  
  try {
    process.chdir(path.join(__dirname, 'backend'));
    execSync('npx prisma generate', { stdio: 'inherit' });
    logSuccess('Prisma client generated');
    return true;
  } catch (error) {
    logError(`Failed to generate Prisma client: ${error.message}`);
    return false;
  }
}

function createStartupScripts() {
  logInfo('Creating startup scripts...');
  
  // Backend start script
  const backendStartScript = `#!/bin/bash
echo "🚀 Starting AI Stylist Backend..."
cd backend
npm run dev
`;
  
  // Mobile app start script
  const mobileStartScript = `#!/bin/bash
echo "📱 Starting AI Stylist Mobile App..."
cd mobile-app
npx expo start
`;
  
  // Combined start script
  const startAllScript = `#!/bin/bash
echo "🎉 Starting AI Stylist App (Backend + Mobile)"
echo "Opening two terminal windows..."

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start mobile app
cd ../mobile-app && npx expo start &
MOBILE_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Mobile PID: $MOBILE_PID"
echo "Press Ctrl+C to stop both services"

# Wait for user interrupt
trap "kill $BACKEND_PID $MOBILE_PID; exit" INT
wait
`;
  
  fs.writeFileSync(path.join(__dirname, 'start-backend.sh'), backendStartScript);
  fs.writeFileSync(path.join(__dirname, 'start-mobile.sh'), mobileStartScript);
  fs.writeFileSync(path.join(__dirname, 'start-all.sh'), startAllScript);
  
  // Make scripts executable
  try {
    execSync('chmod +x start-backend.sh start-mobile.sh start-all.sh');
    logSuccess('Startup scripts created');
    return true;
  } catch (error) {
    logWarning('Could not make scripts executable - run manually with bash');
    return true;
  }
}

// Main fix function
async function runQuickFix() {
  let allGood = true;
  
  // Run all fixes
  allGood &= fixBackendEnv();
  allGood &= fixMobileAppConfig();
  allGood &= installDependencies();
  allGood &= generatePrismaClient();
  allGood &= checkDatabaseConnection();
  allGood &= createStartupScripts();
  
  console.log('\n' + '=' .repeat(50));
  
  if (allGood) {
    logSuccess('🎉 All fixes applied successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update backend/.env with your actual database and API credentials');
    console.log('2. Start PostgreSQL: brew services start postgresql');
    console.log('3. Start Redis: brew services start redis');
    console.log('4. Run: ./start-all.sh (or use individual scripts)');
    console.log('\n🚀 Your AI Stylist app should now work perfectly!');
  } else {
    logWarning('⚠️  Some fixes failed - please check the errors above');
    console.log('\n📋 Manual Steps:');
    console.log('1. Ensure PostgreSQL and Redis are installed and running');
    console.log('2. Create backend/.env with proper credentials');
    console.log('3. Run: cd backend && npm install && npx prisma db push');
    console.log('4. Run: cd mobile-app && npm install');
    console.log('5. Start backend: cd backend && npm run dev');
    console.log('6. Start mobile: cd mobile-app && npx expo start');
  }
}

// Run the fix
runQuickFix().catch(error => {
  logError(`Quick fix failed: ${error.message}`);
  process.exit(1);
});