// Simple test to check if server starts without errors
const { spawn } = require('child_process');

console.log('Testing server startup...');

const server = spawn('node', ['dist/server.js'], {
    env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: '5001',
        JWT_SECRET: 'test-secret-key-for-testing-only',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
        REDIS_URL: 'redis://localhost:6379'
    }
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('STDERR:', data.toString());
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);

    if (code === 0) {
        console.log('✅ Server started successfully!');
    } else {
        console.log('❌ Server failed to start');
        console.log('Error output:', errorOutput);
    }

    process.exit(code);
});

// Kill server after 5 seconds
setTimeout(() => {
    console.log('Killing server after 5 seconds...');
    server.kill('SIGTERM');
}, 5000);