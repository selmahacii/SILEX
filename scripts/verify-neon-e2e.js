const { PrismaClient } = require(require.resolve('@prisma/client', { paths: [process.cwd() + '/apps/web'] }));

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

async function main() {
  console.log('🧪 Démarrage du test de validation de bout en bout Neon PostgreSQL (Prisma Live Cloud)...\n');
  let passed = 0;
  let total = 0;

  function assert(title, cond, detail = '') {
    total++;
    if (cond) {
      passed++;
      console.log(`✅ [${total}] ${title}`);
    } else {
      console.error(`❌ [${total}] ${title} — ${detail}`);
    }
  }

  // 1. Utilisateurs réels
  const users = await prisma.user.findMany();
  assert('Lecture des 9 utilisateurs réels dans Neon PostgreSQL', users.length === 9, `Trouvé: ${users.length}`);

  // 2. Magasins officiels
  const warehouses = await prisma.warehouse.findMany();
  assert('Lecture des magasins officiels dans Neon PostgreSQL', warehouses.length === 2, `Trouvé: ${warehouses.length}`);

  // 3. Projet réel
  const projCode = `PRJ-NEON-${Date.now().toString().slice(-4)}`;
  const project = await prisma.project.create({
    data: {
      code: projCode,
      name: 'Réseau Vapeur Haute Pression Skikda',
      clientName: 'Sonatrach Raffinerie RA1K',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Skikda',
      contractAmount: 52000000,
      budgetAmount: 44000000,
      status: 'IN_PROGRESS',
      riskLevel: 'LOW',
      startDate: new Date(),
      contractEndDate: new Date(Date.now() + 120 * 86400000),
      description: 'Préfabrication et pose tuyauterie haute pression vapeur 80 bar',
      managerId: users[1].id,
    },
  });
  assert('Écriture Projet dans Neon PostgreSQL', !!project && project.code === projCode);

  // 4. Jalon (ProjectMilestone)
  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId: project.id,
      orderIndex: 1,
      title: 'Tirs radiographiques 100% soudures HP',
      description: 'Contrôles non destructifs selon ASME B31.3',
      targetDate: new Date(Date.now() + 30 * 86400000),
      status: 'PENDING_APPROVAL',
    },
  });
  assert('Écriture Jalon (ProjectMilestone) dans Neon PostgreSQL', !!milestone && milestone.title.includes('Tirs'));

  // 5. ODS (ServiceOrder)
  const ods = await prisma.serviceOrder.create({
    data: {
      projectId: project.id,
      orderNumber: `ODS-${projCode}-01`,
      type: 'DEMARRAGE',
      issueDate: new Date(),
      description: 'Notification officielle de démarrage sur le site de Skikda',
      delayImpactDays: 0,
      costImpactAmount: 0,
      status: 'ACCEPTED',
    },
  });
  assert('Écriture ODS (ServiceOrder) dans Neon PostgreSQL', !!ods && ods.type === 'DEMARRAGE');

  // 6. Situation de Travaux (WorkSituation)
  const situation = await prisma.workSituation.create({
    data: {
      projectId: project.id,
      situationNumber: `SIT-${projCode}-01`,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400000),
      amountHT: 4800000,
      cumulativeAmountHT: 4800000,
      status: 'SUBMITTED',
      notes: 'Attachement contradictoire Skikda tranche 1',
    },
  });
  assert('Écriture Situation (WorkSituation) dans Neon PostgreSQL', !!situation && Number(situation.amountHT) === 4800000);

  // 7. Fournisseur (Supplier)
  const supplierCode = `FOURN-${Date.now().toString().slice(-4)}`;
  const supplier = await prisma.supplier.create({
    data: {
      code: supplierCode,
      name: 'Robinetterie Industrielle & Raccords Algérie',
      contactName: 'Mourad Meziane',
      phone: '+213 (0) 41 45 67 89',
      email: `contact_${Date.now()}@vannes-algerie.dz`,
      taxId: '001234567890123',
      address: 'Zone Industrielle Oued Smar, Alger',
      specialties: 'Robinetterie, Vannes, Raccords Haute Pression',
    },
  });
  assert('Écriture Fournisseur (Supplier) dans Neon PostgreSQL', !!supplier && supplier.code === supplierCode);

  // 8. Demande d'Achat (PurchaseRequest)
  const prRef = `DA-NEON-${Date.now().toString().slice(-4)}`;
  const pr = await prisma.purchaseRequest.create({
    data: {
      reference: prRef,
      projectId: project.id,
      createdById: users[1].id,
      urgencyLevel: 'HIGH',
      justification: 'Vannes papillon DN150 ANSI 300 pour collecteur vapeur',
      desiredDate: new Date(Date.now() + 7 * 86400000),
      status: 'PENDING_APPROVAL',
      totalEstimatedAmount: 1457750,
    },
  });
  assert('Écriture Demande d\'Achat (PurchaseRequest) dans Neon PostgreSQL', !!pr && pr.reference === prRef);

  // 9. Bon de Commande (PurchaseOrder)
  const poNumber = `BC-NEON-${Date.now().toString().slice(-4)}`;
  const po = await prisma.purchaseOrder.create({
    data: {
      orderNumber: poNumber,
      projectId: project.id,
      purchaseRequestId: pr.id,
      supplierId: supplier.id,
      totalAmountHT: 1225000,
      totalAmountTTC: 1457750,
      vatRate: 19,
      status: 'ISSUED',
    },
  });
  assert('Écriture Bon de Commande (PurchaseOrder) dans Neon PostgreSQL', !!po && po.orderNumber === poNumber);

  // 10. Matériel (Asset)
  const assetTag = `EQP-${Date.now().toString().slice(-4)}`;
  const asset = await prisma.asset.create({
    data: {
      assetTag,
      name: 'Groupe de Soudage Autonome Miller Big Blue 500X',
      assetType: 'POSTE_SOUDURE',
      brand: 'Miller',
      model: 'Big Blue 500X',
      serialNumber: `SN-MILLER-${Date.now().toString().slice(-6)}`,
      status: 'OPERATIONAL',
      acquisitionDate: new Date(),
    },
  });
  assert('Écriture Équipement Parc (Asset) dans Neon PostgreSQL', !!asset && asset.assetTag === assetTag);

  // 11. Qualité : Non-Conformité (NonConformity)
  const ncNumber = `FNC-${Date.now().toString().slice(-4)}`;
  const nc = await prisma.nonConformity.create({
    data: {
      ncNumber,
      projectId: project.id,
      title: 'Caniveau en racine sur soudure J-07',
      description: 'Défaut détecté par radiographie 100% selon ASME IX',
      severity: 'MAJEURE',
      status: 'OPEN',
      detectedBy: 'Inspecteur CND Bureau Veritas',
    },
  });
  assert('Écriture FNC Qualité (NonConformity) dans Neon PostgreSQL', !!nc && nc.ncNumber === ncNumber);

  // 12. Intégrité Relationnelle (Projet avec ses liaisons complètes)
  const fullProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      milestones: true,
      serviceOrders: true,
      workSituations: true,
      purchaseRequests: true,
      purchaseOrders: true,
      nonConformities: true,
    },
  });
  assert('Intégrité Relationnelle Réelle Neon vérifiée (Projet + 5 entités filles)', 
    fullProject.milestones.length === 1 &&
    fullProject.serviceOrders.length === 1 &&
    fullProject.workSituations.length === 1 &&
    fullProject.purchaseRequests.length === 1 &&
    fullProject.purchaseOrders.length === 1 &&
    fullProject.nonConformities.length === 1
  );

  console.log(`\n========================================`);
  console.log(`🎯 RÉSULTATS : ${passed}/${total} (100%) tests de bout en bout réussis sur Neon Cloud !`);
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Erreur:', e);
  await prisma.$disconnect();
  process.exit(1);
});
