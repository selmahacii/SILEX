const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/web/node_modules/@prisma/client'));

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const match = envContent.match(/DIRECT_URL=["']([^"']+)["']/);
const url = match ? match[1] : null;

console.log('Connecting to Neon:', url.replace(/:[^:@]+@/, ':***@'));
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function run() {
  try {
    const tables = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
    );
    console.log(`\nFound ${tables.length} tables on Neon:`);
    console.log(tables.map(t => t.table_name).join(', '));

    try {
      const migs = await prisma.$queryRawUnsafe('SELECT * FROM "_prisma_migrations" ORDER BY finished_at ASC');
      console.log('\nMigrations recorded on Neon:');
      console.table(migs);
    } catch (e) {
      console.log('\nNo "_prisma_migrations" table exists on Neon:', e.message);
    }
  } catch (err) {
    console.error('Error querying Neon:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
