const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIPAddress();
console.log('🌐 Your computer\'s IP address:', ip);
console.log('📱 For mobile testing, update the API URL to:');
console.log(`   http://${ip}:3003/api`);
console.log('');
console.log('📝 Update this in: ai-stylist-app/mobile-app/src/services/api.ts');
console.log(`   Replace 'http://localhost:3003/api' with 'http://${ip}:3003/api'`);