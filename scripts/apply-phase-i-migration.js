const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/web/node_modules/@prisma/client'));

async function applyMigration() {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/silex_test_db?schema=public';
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  const sqlPath = path.resolve(__dirname, '../apps/web/prisma/migrations/20261116_phase_i_persistence/migration.sql');
  const rawSql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolon
  const statements = rawSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      const firstLine = stmt.split('\n').find(l => !l.startsWith('--')) || '';
      console.log(`[${i + 1}/${statements.length}] Executed: ${firstLine.substring(0, 50)}...`);
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log(`[${i + 1}/${statements.length}] Notice: Already exists (skipping).`);
      } else {
        console.error(`Error on statement ${i + 1}:`, stmt);
        throw err;
      }
    }
  }

  console.log('Migration successfully executed!');
  const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
  console.log('Updated Tables in 5433 (' + tables.length + '):', tables.map(r => r.table_name));
  await prisma.$disconnect();
}

applyMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
