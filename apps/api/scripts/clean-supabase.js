const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAll() {
  const tableRows = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const tableNames = tableRows.map(t => t.table_name);
  console.log('Tables found in database:', tableNames);

  // Exclude User and Department
  const tablesToTruncate = tableNames.filter(t => !['User', 'Department', '_prisma_migrations'].includes(t));

  console.log('Truncating tables:', tablesToTruncate);

  for (const t of tablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE;`);
      console.log('TRUNCATED: ' + t);
    } catch (e) {
      console.log('Error truncating ' + t + ':', e.message);
    }
  }

  console.log('\n--- VERIFICATION FINALE DES COMPTEURS ---');
  const models = [
    'project', 'projectMilestone', 'projectTask', 'serviceOrder', 'workSituation',
    'purchaseRequest', 'purchaseOrder', 'supplier', 'item', 'warehouse',
    'stockMovement', 'employee', 'attendance', 'asset', 'maintenanceOrder',
    'nonConformity', 'auditLog', 'notification'
  ];

  for (const m of models) {
    try {
      const c = await prisma[m].count();
      console.log(m + ' count:', c);
    } catch (e) {
      console.log(m + ' count error:', e.message);
    }
  }

  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  console.log('\nPreserved system data:');
  console.log('Users (authentification):', userCount);
  console.log('Departments:', deptCount);

  await prisma.$disconnect();
}

cleanAll().catch(console.error);
