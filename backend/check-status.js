#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking backend status...\n');

// Check 1: Environment file
console.log('1. 📄 Environment Configuration');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDbUrl = envContent.includes('DATABASE_URL=');
  const hasJwtSecret = envContent.includes('JWT_SECRET=');
  console.log(`   ${hasDbUrl ? '✅' : '❌'} DATABASE_URL configured`);
  console.log(`   ${hasJwtSecret ? '✅' : '❌'} JWT_SECRET configured`);
} else {
  console.log('   ❌ .env file missing');
}

// Check 2: Dependencies
console.log('\n2. 📦 Dependencies');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ❌ node_modules missing - run: npm install');
}

// Check 3: Prisma Client
console.log('\n3. 🗄️  Prisma Client');
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('   ✅ Prisma client generated');
} else {
  console.log('   ❌ Prisma client missing - run: npx prisma generate');
}

// Check 4: TypeScript Compilation
console.log('\n4. 📝 TypeScript Compilation');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation successful');
} catch (error) {
  console.log('   ❌ TypeScript compilation errors');
  console.log('   💡 Run: npm run build');
}

// Check 5: Database Schema
console.log('\n5. 🏗️  Database Schema');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ Prisma schema exists');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const hasSeasonalTrend = schemaContent.includes('model SeasonalTrend');
  const hasPhotoAnalysis = schemaContent.includes('model PhotoAnalysis');
  console.log(`   ${hasSeasonalTrend ? '✅' : '❌'} SeasonalTrend model`);
  console.log(`   ${hasPhotoAnalysis ? '✅' : '❌'} PhotoAnalysis model`);
} else {
  console.log('   ❌ Prisma schema missing');
}

// Check 6: API Routes
console.log('\n6. 🛣️  API Routes');
const routesPath = path.join(__dirname, 'src', 'routes');
const expectedRoutes = ['ai.ts', 'auth.ts', 'dashboard.ts', 'trends.ts', 'user.ts'];
let routesExist = 0;

expectedRoutes.forEach(route => {
  const routePath = path.join(routesPath, route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route}`);
    routesExist++;
  } else {
    console.log(`   ❌ ${route} missing`);
  }
});

// Check 7: Services
console.log('\n7. 🔧 Services');
const servicesPath = path.join(__dirname, 'src', 'services');
const expectedServices = ['aiService.ts', 'cacheService.ts', 'dashboardService.ts'];
let servicesExist = 0;

expectedServices.forEach(service => {
  const servicePath = path.join(servicesPath, service);
  if (fs.existsSync(servicePath)) {
    console.log(`   ✅ ${service}`);
    servicesExist++;
  } else {
    console.log(`   ❌ ${service} missing`);
  }
});

// Check 8: Middleware
console.log('\n8. 🛡️  Middleware');
const middlewarePath = path.join(__dirname, 'src', 'middleware');
const expectedMiddleware = ['auth.ts', 'errorHandler.ts', 'validation.ts'];
let middlewareExist = 0;

expectedMiddleware.forEach(middleware => {
  const mwPath = path.join(middlewarePath, middleware);
  if (fs.existsSync(mwPath)) {
    console.log(`   ✅ ${middleware}`);
    middlewareExist++;
  } else {
    console.log(`   ❌ ${middleware} missing`);
  }
});

// Summary
console.log('\n📊 Status Summary:');
console.log(`   Routes: ${routesExist}/${expectedRoutes.length}`);
console.log(`   Services: ${servicesExist}/${expectedServices.length}`);
console.log(`   Middleware: ${middlewareExist}/${expectedMiddleware.length}`);

const totalChecks = 8;
let passedChecks = 0;

// Calculate passed checks (simplified)
if (fs.existsSync(envPath)) passedChecks++;
if (fs.existsSync(nodeModulesPath)) passedChecks++;
if (fs.existsSync(prismaClientPath)) passedChecks++;
if (routesExist === expectedRoutes.length) passedChecks++;
if (servicesExist === expectedServices.length) passedChecks++;
if (middlewareExist === expectedMiddleware.length) passedChecks++;

console.log(`\n🎯 Overall Status: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Backend is ready to run!');
  console.log('🚀 Start with: npm run dev');
} else {
  console.log('\n⚠️  Some issues found. Run the fix script:');
  console.log('🔧 Fix with: npm run fix');
}

console.log('\n📋 Available Commands:');
console.log('   npm run fix          # Fix all issues');
console.log('   npm run dev          # Start development server');
console.log('   npm run build        # Build for production');
console.log('   npm run test:health  # Test server health');
console.log('   npm run test:endpoints # Test API endpoints');