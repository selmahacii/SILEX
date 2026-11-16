const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

process.env.DATABASE_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';
process.env.DIRECT_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';
process.env.PORT = '3001';
process.env.NODE_ENV = 'production';

const webDir = path.join(__dirname, '..', 'apps', 'web');
const nextBin = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('Starting Next.js on port 3001...');
const logFd = fs.openSync(path.join(__dirname, 'server.log'), 'w');

const child = spawn(process.execPath, [nextBin, 'start', '-p', '3001'], {
  cwd: webDir,
  env: process.env,
  detached: false,
  stdio: ['ignore', logFd, logFd]
});

child.on('error', (err) => {
  console.error('Child failed to start:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Child exited with code ${code}, signal ${signal}`);
});

console.log('Next.js process spawned with PID:', child.pid);

// Keep this parent process alive
setInterval(() => {}, 60000);
