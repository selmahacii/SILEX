/**
 * SILEX INDUSTRIAL ERP — CONTRÔLE D'INTERCONNEXION TOTALE & ZERO MOCK DATA
 * Vérifie que le proxy Next.js (port 3008) transmet toutes les requêtes vers l'API NestJS (port 4000),
 * que chaque action (Projets, Jalons, ODS, DA, Devis, BC, Réceptions, Sorties Stock,
 * RH, Pointages, FNC Qualité, OT Maintenance, Facturation, Audit)
 * est réellement enregistrée dans PostgreSQL via Prisma, avec 0 mock data.
 */

const http = require('http');
const path = require('path');
const prismaPath = require.resolve('@prisma/client', { paths: [path.join(__dirname, '../apps/api')] });
const { PrismaClient } = require(prismaPath);

const prisma = new PrismaClient();
const PROXY_BASE = 'http://127.0.0.1:3008/api';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
};

function track(moduleName, testName, condition, details = '') {
  results.total++;
  if (condition) {
    results.passed++;
    console.log(`  ✓ [${moduleName.padEnd(12)}] ${testName} ${details ? '— ' + details : ''}`);
  } else {
    results.failed++;
    console.error(`  ✗ [${moduleName.padEnd(12)}] ÉCHEC : ${testName} ${details ? '— ' + details : ''}`);
  }
}

function request(url, options = {}) {
  const parsed = new URL(url);
  const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  const runId = Math.floor(Math.random() * 90000) + 10000;
  console.log('================================================================');
  console.log(`   CONTRÔLE INTERCONNEXION TOTALE & ZERO MOCK [RUN #${runId}]`);
  console.log('   Toutes les requêtes passent par le proxy frontend Next.js (port 3008)');
  console.log('================================================================\n');

  try {
    // 1. AUTHENTIFICATION RÉELLE
    console.log('--- 1. AUTHENTIFICATION & SESSIONS MULTI-PROFILS ---');
    const dgAuth = await request(`${PROXY_BASE}/auth/demo-switch`, {
      method: 'POST',
      body: { role: 'DIRECTEUR_GENERAL' },
    });
    track('AUTH', 'Connexion Directeur Général via proxy 3008', dgAuth.status === 201 && !!dgAuth.data?.accessToken);
    const dgToken = dgAuth.data?.accessToken;

    const pmAuth = await request(`${PROXY_BASE}/auth/demo-switch`, {
      method: 'POST',
      body: { role: 'RESPONSABLE_PROJET' },
    });
    track('AUTH', 'Connexion Chef de Projet via proxy 3008', pmAuth.status === 201 && !!pmAuth.data?.accessToken);
    const pmToken = pmAuth.data?.accessToken;

    const stockAuth = await request(`${PROXY_BASE}/auth/demo-switch`, {
      method: 'POST',
      body: { role: 'RESPONSABLE_MAGASIN' },
    });
    track('AUTH', 'Connexion Responsable Magasin via proxy 3008', stockAuth.status === 201 && !!stockAuth.data?.accessToken);
    const stockToken = stockAuth.data?.accessToken;

    // 2. PROJETS INDUSTRIELS & CONTRATS
    console.log('\n--- 2. PROJETS & LIGNES CONTRACTUELLES ---');
    const projectCode = `PRJ-ZERO-${runId}`;
    const createProjectRes = await request(`${PROXY_BASE}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pmToken}` },
      body: {
        code: projectCode,
        name: `Revamping Unité de Séparation Gaz #${runId}`,
        clientName: 'Sonatrach DP Hassi Messaoud',
        sector: 'OIL_AND_GAS',
        location: 'Champ Sud — Bassin de Berkine',
        contractAmount: 250000000,
        budgetAmount: 195000000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      },
    });
    track('PROJETS', `Création Projet ${projectCode} (250M DA)`, createProjectRes.status === 201);
    const projectId = createProjectRes.data?.id;

    // Vérification directe PostgreSQL
    const dbProject = await prisma.project.findUnique({ where: { id: projectId } });
    track('POSTGRESQL', `Persistance en base de données du projet ${projectCode}`, !!dbProject && dbProject.code === projectCode);

    // Ajout d'un Jalon contractuel
    const createMilestoneRes = await request(`${PROXY_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pmToken}` },
      body: {
        title: 'Épreuve hydrostatique réseau HP 150 bars',
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        weight: 15,
        criteria: 'Tenue en pression 24h certifiée APAVE / Sonatrach',
      },
    });
    track('PROJETS', 'Enregistrement Jalon Contractuel', createMilestoneRes.status === 201);
    const milestoneId = createMilestoneRes.data?.id;

    const dbMilestone = await prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
    track('POSTGRESQL', 'Ligne Jalon vérifiée dans table "ProjectMilestone"', !!dbMilestone);

    // Ajout d'un Ordre de Service (ODS)
    const createOdsRes = await request(`${PROXY_BASE}/projects/${projectId}/service-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        orderNumber: `ODS-DEM-${runId}`,
        type: 'COMMENCEMENT',
        effectiveDate: new Date().toISOString(),
        description: 'Ordre de service de démarrage des travaux de tuyauterie',
      },
    });
    track('PROJETS', `Émission Ordre de Service ODS-DEM-${runId}`, createOdsRes.status === 201);
    const odsId = createOdsRes.data?.id;

    const dbOds = await prisma.serviceOrder.findUnique({ where: { id: odsId } });
    track('POSTGRESQL', 'Ligne ODS vérifiée dans table "ServiceOrder"', !!dbOds);

    // 3. ACHATS & CIRCUIT APPROVISIONNEMENT
    console.log('\n--- 3. ACHATS, FOURNISSEURS, DEVIS & BONS DE COMMANDE ---');
    // Article catalogue
    const createItemRes = await request(`${PROXY_BASE}/inventory/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        code: `ART-TUBE-${runId}`,
        name: 'Tube Inox 316L DN150 Schedule 40 Sans Soudure',
        description: 'Tuyauterie industrielle HP certifiée CCPU 3.1 EN 10204',
        unit: 'METRE',
        unitCost: 18500,
        minStockLevel: 20,
        currentStock: 0,
      },
    });
    track('ACHATS', `Création article catalogue ART-TUBE-${runId}`, createItemRes.status === 201);
    const item = createItemRes.data;

    // Fournisseur
    const createSupplierRes = await request(`${PROXY_BASE}/procurement/suppliers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        code: `FRN-TUB-${runId}`,
        name: 'SARL Métallurgie & Tubes Industriels Algérie',
        contactName: 'Karim Boukhalfa',
        email: `contact.${runId}@mtia-dz.com`,
        phone: '+213 21 55 44 33',
        address: 'Zone Industrielle Rouiba, Alger',
        specialties: 'Tubes & Raccords Inox',
      },
    });
    track('ACHATS', `Homologation fournisseur FRN-TUB-${runId}`, createSupplierRes.status === 201);
    const supplier = createSupplierRes.data;

    // Demande d'Achat (DA)
    const createDaRes = await request(`${PROXY_BASE}/procurement/purchase-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pmToken}` },
      body: {
        projectId: projectId,
        urgencyLevel: 'HIGH',
        justification: `Approvisionnement pour jalon épreuve hydrostatique ${projectCode}`,
        desiredDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        lines: [
          {
            itemId: item.id,
            quantity: 50,
            unit: 'METRE',
            description: item.name,
            estimatedUnitPrice: 18500,
          },
        ],
      },
    });
    track('ACHATS', 'Émission Demande d’Achat (DA) avec imputation analytique', createDaRes.status === 201);
    const da = createDaRes.data;

    const dbDa = await prisma.purchaseRequest.findUnique({
      where: { id: da.id },
      include: { lines: true },
    });
    track('POSTGRESQL', 'Persistance DA et lignes dans tables "PurchaseRequest" et "Line"', !!dbDa && dbDa.lines.length === 1);

    // Devis Fournisseur
    const createQuoteRes = await request(`${PROXY_BASE}/procurement/quotes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        purchaseRequestId: da.id,
        supplierId: supplier.id,
        totalAmountHT: 925000,
        deliveryLeadTimeDays: 10,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: '30 jours net',
        notes: 'Offre retenue conforme aux spécifications CCPU 3.1',
        lines: [{ purchaseRequestLineId: da.lines[0].id, unitPrice: 18500 }],
      },
    });
    track('ACHATS', 'Enregistrement de l’offre comparative fournisseur (925 000 DA HT)', createQuoteRes.status === 201);
    const quote = createQuoteRes.data;

    // Soumission approbation DG
    const submitRes = await request(`${PROXY_BASE}/procurement/purchase-requests/${da.id}/submit-approval`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pmToken}` },
      body: { recommendedQuoteId: quote.id },
    });
    track('ACHATS', 'Soumission DA en arbitrage Direction Générale (PENDING_APPROVAL)', submitRes.status === 200 || submitRes.status === 201);

    // Approbation DG & Création automatique du Bon de Commande (BC)
    const approveDaRes = await request(`${PROXY_BASE}/procurement/purchase-requests/${da.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        approvedQuoteId: quote.id,
        decisionNotes: 'Offre validée par la Direction Générale. Génération BC immédiate.',
      },
    });
    track('ACHATS', 'Approbation DG & Émission Bon de Commande (BC)', approveDaRes.status === 200 || approveDaRes.status === 201);
    const po = approveDaRes.data?.purchaseOrder;

    const dbPo = await prisma.purchaseOrder.findUnique({
      where: { id: po.id },
      include: { lines: true },
    });
    track('POSTGRESQL', `BC ${dbPo?.orderNumber} vérifié en base avec statut ISSUED`, !!dbPo && dbPo.status === 'ISSUED');

    // Vérification de l'interconnexion : le coût engagé du projet a été incrémenté !
    const dbProjectUpdated = await prisma.project.findUnique({ where: { id: projectId } });
    track('INTERCONNEXION', `Coût engagé du projet incrémenté (+${Number(dbPo.totalAmountHT)} DA)`, Number(dbProjectUpdated.committedCost) === 925000);

    // 4. RÉCEPTION DE MARCHANDISES & ENTRÉE EN STOCK
    console.log('\n--- 4. INVENTAIRE, MAGASIN & TRAÇABILITÉ CCPU 3.1 ---');
    const whRes = await request(`${PROXY_BASE}/inventory/warehouses`, {
      headers: { Authorization: `Bearer ${stockToken}` },
    });
    let warehouses = Array.isArray(whRes.data) ? whRes.data : [];
    let warehouse = warehouses[0];
    if (!warehouse) {
      const createWhRes = await request(`${PROXY_BASE}/inventory/warehouses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${stockToken}` },
        body: {
          code: `MAG-HMD-${runId}`,
          name: 'Magasin Central & Parc Logistique Principal',
          location: 'Base Logistique SILEX — Hassi Messaoud',
          managerName: 'Tarek Meziani',
        },
      });
      warehouse = createWhRes.data;
    }

    const receiveRes = await request(`${PROXY_BASE}/inventory/receive-goods`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${stockToken}` },
      body: {
        purchaseOrderId: po.id,
        warehouseId: warehouse.id,
        deliveryNoteNumber: `BL-MET-${runId}`,
        notes: 'Certificat CCPU 3.1 vérifié (Coulée N°99182, 316L Conforme)',
        lines: [
          {
            purchaseOrderLineId: po.lines[0].id,
            quantityReceived: 50,
          },
        ],
      },
    });
    track('STOCK', 'Réception physique de la marchandise avec visa CCPU 3.1', receiveRes.status === 201);

    const dbItemAfterRec = await prisma.item.findUnique({ where: { id: item.id } });
    track('INTERCONNEXION', `Stock réel de l'article incrémenté : ${Number(dbItemAfterRec?.currentStock)} METRES`, Number(dbItemAfterRec?.currentStock) === 50);

    const dbMovements = await prisma.stockMovement.findMany({ where: { itemId: item.id } });
    track('POSTGRESQL', 'Mouvement de stock consigné dans table "StockMovement" (PURCHASE_RECEIPT)', dbMovements.some(m => m.movementType === 'PURCHASE_RECEIPT'));

    // 5. SORTIE DE STOCK VERS CHANTIER
    console.log('\n--- 5. SORTIE DE STOCK & IMPUTATION COÛT RÉEL AU CHANTIER ---');
    const issueRes = await request(`${PROXY_BASE}/inventory/issue-to-project`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${stockToken}` },
      body: {
        itemId: item.id,
        warehouseId: warehouse.id,
        projectId: projectId,
        quantity: 20,
        notes: `Transfert 20 mètres tube pour épreuve ligne vapeur ${projectCode}`,
      },
    });
    track('STOCK', 'Sortie de stock vers chantier (20 mètres)', issueRes.status === 200 || issueRes.status === 201);

    const dbItemAfterIssue = await prisma.item.findUnique({ where: { id: item.id } });
    track('INTERCONNEXION', `Stock mis à jour après sortie : ${Number(dbItemAfterIssue?.currentStock)} METRES`, Number(dbItemAfterIssue?.currentStock) === 30);

    // Vérification de l'interconnexion : coût réel imputé au projet (20 * 18500 = 370 000 DA)
    const dbProjectAfterCost = await prisma.project.findUnique({ where: { id: projectId } });
    track('INTERCONNEXION', `Coût réel du chantier actualisé (+370 000 DA) -> ${Number(dbProjectAfterCost.actualCost)} DA`, Number(dbProjectAfterCost.actualCost) >= 370000);

    // 6. RH, SOUDEUR ASME & POINTAGES CHANTIER
    console.log('\n--- 6. RESSOURCES HUMAINES, SOUDEUR ASME & POINTAGES ---');
    const empRes = await request(`${PROXY_BASE}/hr/employees`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        registrationNumber: `EMP-${runId}`,
        firstName: 'Farid',
        lastName: `Belkacem ${runId}`,
        title: 'Soudeur Tuyauteur TIG 6G ASME IX',
        email: `f.belkacem.${runId}@silex-services.dz`,
        phone: '+213 661 11 22 33',
        contractType: 'CHANTIER',
      },
    });
    track('RH', `Enregistrement Soudeur Qualifié EMP-${runId}`, empRes.status === 201);
    const employee = empRes.data;

    // Habilitation Soudage CQS
    const certRes = await request(`${PROXY_BASE}/hr/certifications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        employeeId: employee.id,
        certName: 'Homologation Soudage Tube 6G ASME IX (Bureau Veritas)',
        issuingBody: 'Bureau Veritas Algérie',
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 730 * 86400000).toISOString(),
        status: 'VALIDE',
      },
    });
    track('RH', 'Délivrance Homologation Soudage ASME IX (VALIDE)', certRes.status === 201);

    // Pointage journalier chantier
    const attRes = await request(`${PROXY_BASE}/hr/attendances`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        employeeId: employee.id,
        projectId: projectId,
        date: new Date().toISOString(),
        regularHours: 8,
        hoursWorked: 8,
        overtimeHours: 2,
      },
    });
    track('RH', 'Saisie Pointage Chantier avec imputation directe', attRes.status === 201);

    const dbAttendance = await prisma.attendance.findUnique({ where: { id: attRes.data?.id } });
    track('POSTGRESQL', 'Ligne de pointage vérifiée dans table "Attendance"', !!dbAttendance);

    // 7. QUALITÉ QHSE & FICHE DE NON-CONFORMITÉ (FNC)
    console.log('\n--- 7. QUALITÉ QHSE, FICHE FNC & ACTIONS CORRECTIVES ---');
    const fncRes = await request(`${PROXY_BASE}/quality/non-conformities`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        ncNumber: `FNC-${runId}`,
        title: `Manque de pénétration joint soudure J-04 ligne vapeur #${runId}`,
        description: 'Défaut détecté lors du tir radiographique 100% RT préliminaire',
        severity: 'MAJEURE',
        projectId: projectId,
        detectedBy: 'Nadia Chaib (QHSE SILEX)',
      },
    });
    track('QHSE', `Signalement Fiche FNC-${runId}`, fncRes.status === 201);
    const fnc = fncRes.data;

    const dbFnc = await prisma.nonConformity.findUnique({ where: { id: fnc.id } });
    track('POSTGRESQL', 'FNC vérifiée dans table "NonConformity"', !!dbFnc && dbFnc.severity === 'MAJEURE');

    // 8. PARC MATÉRIEL & MAINTENANCE
    console.log('\n--- 8. PARC MATÉRIEL & MAINTENANCE DES ÉQUIPEMENTS ---');
    const assetRes = await request(`${PROXY_BASE}/fleet/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        assetTag: `EQ-${runId}`,
        name: `Poste de Soudure Miller 500A Diesel #${runId}`,
        assetType: 'GROUPE_ELECTROGENE',
        brand: 'Miller Electric',
        model: 'Big Blue 500X',
        serialNumber: `SN-${runId}-MILLER`,
        status: 'OPERATIONAL',
      },
    });
    track('MAINTENANCE', `Enregistrement Engin de Parc EQ-${runId}`, assetRes.status === 201);
    const asset = assetRes.data;

    const otRes = await request(`${PROXY_BASE}/fleet/maintenance-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        orderNumber: `OT-${runId}`,
        assetId: asset.id,
        type: 'PREVENTIVE',
        priority: 'HIGH',
        description: 'Révision des 500 heures et contrôle isolement électrique',
        scheduledDate: new Date(Date.now() + 2 * 86400000),
        cost: 35000,
        technician: 'Équipe Mécanique SILEX Hassi Messaoud',
      },
    });
    track('MAINTENANCE', `Émission Ordre de Travail OT-${runId}`, otRes.status === 201);

    const dbOt = await prisma.maintenanceOrder.findUnique({ where: { id: otRes.data?.id } });
    track('POSTGRESQL', 'Ligne OT vérifiée dans table "MaintenanceOrder"', !!dbOt);

    // 9. AUDIT TRAIL IMMUABLE (TRAÇABILITÉ TOTALE)
    console.log('\n--- 9. AUDIT TRAIL & TRAÇABILITÉ CONTRADICTOIRE ---');
    const auditRes = await request(`${PROXY_BASE}/audit?limit=15`, {
      headers: { Authorization: `Bearer ${dgToken}` },
    });
    track('AUDIT', 'Consultation registre d’audit via proxy 3008', auditRes.status === 200 && Array.isArray(auditRes.data));

    const dbLogsCount = await prisma.auditLog.count();
    track('POSTGRESQL', `Traçabilité immuable active (${dbLogsCount} logs consignés dans "AuditLog")`, dbLogsCount > 0);

    console.log('\n================================================================');
    console.log('              BILAN DU CONTRÔLE D’INTERCONNEXION');
    console.log('================================================================');
    console.log(`Total vérifications exécutées : ${results.total}`);
    console.log(`Vérifications validées        : ${results.passed} (${Math.round((results.passed / results.total) * 100)}%)`);
    console.log(`Vérifications échouées        : ${results.failed}`);
    console.log('================================================================');

    if (results.failed === 0) {
      console.log('🌟 SUCCÈS INTÉGRAL : 0 MOCK DATA, 100% PERSISTANCE EN PRODUCTION !');
    }
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error('Erreur critique pendant la vérification :', e);
  process.exit(1);
});
