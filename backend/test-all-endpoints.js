#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing all backend endpoints...');

const BASE_URL = 'http://localhost:3002';

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200,
    requiresAuth: false
  },
  {
    name: 'Register User',
    method: 'POST',
    path: '/api/auth/register',
    expectedStatus: 201,
    requiresAuth: false,
    body: {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User'
    }
  },
  {
    name: 'Login User',
    method: 'POST',
    path: '/api/auth/login',
    expectedStatus: 200,
    requiresAuth: false,
    body: {
      email: 'test@example.com',
      password: 'Test123!'
    }
  }
];

let authToken = null;

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    if (test.requiresAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (test.body) {
      req.write(JSON.stringify(test.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log(`🚀 Testing ${tests.length} endpoints...\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      const response = await makeRequest(test);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        passed++;
        
        // Store auth token for future requests
        if (test.name === 'Login User' && response.data.token) {
          authToken = response.data.token;
          console.log(`🔑 Auth token stored for authenticated requests`);
        }
      } else {
        console.log(`❌ ${test.name} - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs for details.');
    process.exit(1);
  }
}

// Check if server is running first
console.log('🔍 Checking if server is running...');
makeRequest({ name: 'Server Check', method: 'GET', path: '/health', expectedStatus: 200 })
  .then(() => {
    console.log('✅ Server is running!\n');
    runTests();
  })
  .catch(() => {
    console.log('❌ Server is not running!');
    console.log('💡 Start the server with: npm run dev');
    process.exit(1);
  });