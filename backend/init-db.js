#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this to set up the database with sample data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');

    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create a test user if none exists
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@aistylist.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password: 'TestPass123'
          name: 'Test User',
          profile: {
            create: {
              gender: 'PREFER_NOT_TO_SAY',
              height: 170,
              weight: 65,
              styleType: 'CASUAL'
            }
          }
        },
        include: {
          profile: true
        }
      });

      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };