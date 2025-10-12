// Simple test to check if dev server starts
const { spawn } = require('child_process');

console.log('Testing frontend dev server startup...');

const server = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe'
});

let output = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('STDOUT:', data.toString());

    // Check if server started successfully
    if (output.includes('Local:') || output.includes('localhost')) {
        console.log('✅ Frontend dev server started successfully!');
        server.kill('SIGTERM');
        process.exit(0);
    }
});

server.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString());
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code || 0);
});

// Kill server after 15 seconds if it doesn't start
setTimeout(() => {
    console.log('❌ Server took too long to start');
    server.kill('SIGTERM');
    process.exit(1);
}, 15000);