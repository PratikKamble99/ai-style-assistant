#!/usr/bin/env node

const http = require('http');

console.log('🏥 Testing server health...');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Server is healthy!');
      console.log('📊 Response:', JSON.parse(data));
      process.exit(0);
    } else {
      console.log(`❌ Server returned status ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Server is not running or not accessible');
  console.log('💡 Try running: npm run dev');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Server health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();