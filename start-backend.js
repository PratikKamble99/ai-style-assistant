#!/usr/bin/env node

/**
 * Backend Startup Script
 * Ensures all dependencies are ready and starts the backend server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} found`);
    return true;
  } else {
    console.log(`❌ ${description} missing: ${filePath}`);
    return false;
  }
}

function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: './backend' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function startBackend() {
  console.log('🚀 Starting AI Stylist Backend');
  console.log('=' * 40);

  // 1. Check if we're in the right directory
  if (!fs.existsSync('./backend')) {
    console.log('❌ Backend directory not found. Please run this from the ai-stylist-app root directory.');
    return;
  }

  // 2. Check essential files
  console.log('\n📋 Checking essential files...');
  const essentialFiles = [
    ['./backend/package.json', 'Backend package.json'],
    ['./backend/.env', 'Environment configuration'],
    ['./backend/prisma/schema.prisma', 'Prisma schema'],
    ['./backend/src/server.ts', 'Main server file']
  ];

  let allFilesExist = true;
  for (const [filePath, description] of essentialFiles) {
    if (!checkFile(filePath, description)) {
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    console.log('\n❌ Missing essential files. Please check your setup.');
    return;
  }

  // 3. Install dependencies
  console.log('\n📦 Installing dependencies...');
  if (!runCommand('npm install', 'Installing npm packages')) {
    return;
  }

  // 4. Generate Prisma client
  console.log('\n🗄️  Setting up database...');
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    return;
  }

  // 5. Push database schema
  if (!runCommand('npx prisma db push', 'Pushing database schema')) {
    console.log('⚠️  Database push failed, but continuing...');
  }

  // 6. Build TypeScript
  console.log('\n🔨 Building TypeScript...');
  if (!runCommand('npm run build', 'Building TypeScript')) {
    return;
  }

  // 7. Start the server
  console.log('\n🚀 Starting the backend server...');
  console.log('   Server will start on http://localhost:3003');
  console.log('   Press Ctrl+C to stop the server');
  console.log('   Logs will appear below:');
  console.log('-' * 40);

  try {
    const serverProcess = spawn('npm', ['start'], {
      cwd: './backend',
      stdio: 'inherit'
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping backend server...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    serverProcess.on('close', (code) => {
      console.log(`\n📊 Backend server exited with code ${code}`);
    });

  } catch (error) {
    console.log('❌ Failed to start server:', error.message);
  }
}

// Handle command line execution
if (require.main === module) {
  startBackend().catch(console.error);
}

module.exports = { startBackend };