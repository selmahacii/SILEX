const { execSync } = require('child_process');
const path = require('path');

const command = process.argv[2] || 'status'; // 'status' or 'deploy'

// Staging target is strictly our local PostgreSQL 16 container on port 5433
const STAGING_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';

// SAFETY GATE: Verify target
function assertSafeTarget(url) {
  if (!url) throw new Error('DATABASE_URL is undefined');
  if (url.includes('neon.tech') || url.includes('neondb')) {
    console.error('CRITICAL SAFETY GATE: Attempted to run migration against NEON PRODUCTION! Operation BLOCKED.');
    process.exit(1);
  }
  if (!url.includes('5433') && !url.includes('silex_erp') && !url.includes('silex_restore_test')) {
    console.error('SAFETY GATE: Target database must be isolated staging (5433). Operation BLOCKED.');
    process.exit(1);
  }
  console.log(`[SAFETY GATE PASSED] Target verified: ${url.replace(/:[^:@]+@/, ':***@')}`);
}

assertSafeTarget(STAGING_URL);

const env = {
  ...process.env,
  DATABASE_URL: STAGING_URL,
  DIRECT_URL: STAGING_URL,
};

const prismaBin = path.resolve(__dirname, '../apps/web/node_modules/.bin/prisma.cmd');
const schemaPath = path.resolve(__dirname, '../apps/web/prisma/schema.prisma');

console.log(`Executing "prisma migrate ${command}" on Staging...`);
try {
  execSync(`"${prismaBin}" migrate ${command} --schema="${schemaPath}"`, {
    env,
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
} catch (err) {
  console.error(`Migration command failed with exit code:`, err.status);
  process.exit(err.status || 1);
}
