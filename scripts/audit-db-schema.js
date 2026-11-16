const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/web/node_modules/@prisma/client'));

process.env.DATABASE_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';
process.env.DIRECT_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  console.log('=== AUDIT POSTGRESQL (Port 5433 / silex_erp) ===');
  
  // 1. Migrations appliquées
  const migrations = await prisma.$queryRawUnsafe(
    'SELECT id, migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY finished_at ASC'
  );
  console.log('\n--- Migrations Prisma Appliquées dans _prisma_migrations ---');
  console.table(migrations);

  // 2. Tables physiques
  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name ASC`
  );
  console.log(`\n--- Tables Physiques Détectées (${tables.length} tables) ---`);
  const tableNames = tables.map(t => t.table_name);
  console.log(tableNames.join(', '));

  // 3. Modèles Phase I récents
  const phase1Models = [
    'Opportunity',
    'CostSheet',
    'CostSheetContribution',
    'CostSheetLine',
    'CostSheetRevision',
    'WeldJoint',
    'WeldRepair',
    'DocumentRevision',
    'FinancialAccount',
    'CustomerInvoice',
    'SupplierInvoice',
  ];

  console.log('\n--- Vérification des Modèles Clés ---');
  for (const m of phase1Models) {
    const exists = tableNames.includes(m);
    let count = 0;
    if (exists) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM "${m}"`);
      count = res[0].cnt;
    }
    console.log(`  - ${m.padEnd(25)} : ${exists ? 'PRÉSENTE' : 'MANQUANTE'} (${count} enregistrements)`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erreur audit DB:', err);
  process.exit(1);
});
