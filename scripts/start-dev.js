import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===========================================================');
console.log('   POSTER35 - FIXED ₹35 POSTER ORDERING PLATFORM');
console.log('   Starting Backend (Port 5000) & Frontend (Port 3000)...');
console.log('===========================================================');

const backend = spawn('npm run dev', {
  cwd: path.join(rootDir, 'backend'),
  shell: true,
  stdio: 'inherit'
});

const frontend = spawn('npm run dev', {
  cwd: path.join(rootDir, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

function cleanup() {
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
