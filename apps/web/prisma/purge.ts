import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

let dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const directMatch = envContent.match(/DIRECT_URL=["']?([^"'\r\n]+)["']?/);
    const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    dbUrl = (directMatch ? directMatch[1] : (dbMatch ? dbMatch[1] : dbUrl));
  }
} catch {
  // ignore
}

dbUrl = dbUrl.replace('-pooler', '') + (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=25';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

const TABLES_TO_PURGE = [
  'Attendance',
  'EmployeeCertification',
  'Employee',
  'CostSheetContribution',
  'CostSheetLine',
  'CostSheetRevision',
  'CostSheet',
  'Opportunity',
  'SupplierQuoteLine',
  'SupplierQuote',
  'PurchaseOrderLine',
  'PurchaseOrder',
  'PurchaseRequestLine',
  'PurchaseRequest',
  'GoodsReceiptLine',
  'GoodsReceipt',
  'StockMovement',
  'ProjectMaterialAllocation',
  'ProjectCostEntry',
  'ProjectTask',
  'ProjectMilestone',
  'ServiceOrder',
  'WorkSituation',
  'UserProjectAssignment',
  'Project',
  'Supplier',
  'Item',
  'ItemCategory',
  'Warehouse',
  'MaintenanceOrder',
  'FuelRecord',
  'Asset',
  'DocumentRevision',
  'Document',
  'CorrectiveAction',
  'NonConformity',
  'WeldRepair',
  'WeldJoint',
  'CashTransaction',
  'InvoiceLineMatching',
  'SupplierInvoiceLine',
  'SupplierInvoice',
  'CustomerInvoice',
  'FinancialAccount',
  'FinancialConfig',
  'AuditLog',
  'Notification',
  'RefreshSession',
];

async function main() {
  console.log('🧹 [PURGE] Nettoyage complet de la base de données Neon PostgreSQL...');

  for (const table of TABLES_TO_PURGE) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`  ✓ Table "${table}" vidée avec succès`);
    } catch (err: any) {
      console.warn(`  ⚠ Impossible de vider "${table}" (peut-être inexistante):`, err.message);
    }
  }

  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  const projectCount = await prisma.project.count();
  const oppCount = await prisma.opportunity.count();
  const costSheetCount = await prisma.costSheet.count();
  const empCount = await prisma.employee.count();
  const supCount = await prisma.supplier.count();

  console.log('\n📊 [ÉTAT DE LA BASE APRÈS PURGE] :');
  console.log(`- Utilisateurs préservés : ${userCount}`);
  console.log(`- Départements préservés : ${deptCount}`);
  console.log(`- Projets restants : ${projectCount}`);
  console.log(`- Opportunités restantes : ${oppCount}`);
  console.log(`- Fiches de Coût restantes : ${costSheetCount}`);
  console.log(`- Employés restants : ${empCount}`);
  console.log(`- Fournisseurs restants : ${supCount}`);
  console.log('\n✨ Base de données 100% vierge (à l\'exception des utilisateurs autorisés) !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la purge :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
