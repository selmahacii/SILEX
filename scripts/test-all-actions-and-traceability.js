const { dbBridge } = require(process.cwd() + '/apps/web/src/lib/db-bridge');
const { serverStore } = require(process.cwd() + '/apps/web/src/lib/server-store');

async function testAll() {
  console.log('🧪 ========================================================');
  console.log('🧪 AUDIT FONCTIONNEL : TABLES, LIGNES, ACTIONS & TRAÇABILITÉ');
  console.log('🧪 ========================================================\n');

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

  const ts = Date.now().toString().slice(-4);
  const projCode = `PRJ-AUDIT-${ts}`;

  // 1. CRÉATION PROJET
  console.log('\n--- 1. PROJETS & JALONS ---');
  const proj = await dbBridge.createProject({
    code: projCode,
    name: `Installation Boucle Vapeur Skikda #${ts}`,
    clientName: 'Sonatrach / Raffinerie RA1K',
    sector: 'OIL_AND_GAS',
    siteLocation: 'Zone Industrielle Skikda',
    contractAmount: 145000000,
    budgetAmount: 120000000,
  });
  assert('Création Projet', proj && proj.code === projCode, JSON.stringify(proj));

  // 2. AVANCEMENT PHYSIQUE & FINANCIER
  const updatedProg = await dbBridge.updateProgress(proj.code, 35, 28);
  assert('Ajustement Avancement (35% physique, 28% financier)', updatedProg && (updatedProg.physicalProgress === 35 || updatedProg.physicalProgress === 35.0));

  // 3. JALON CONTRACTUEL
  const mls = await dbBridge.addMilestone(proj.code, {
    title: `Épreuve Hydrostatique Spools Vapeur 80 bar #${ts}`,
    targetDate: '2026-06-15',
    status: 'PENDING',
  });
  assert('Ajout Jalon Contractuel', mls && (mls.title || mls.name).includes('Épreuve'));

  // 4. ORDRE DE SERVICE (ODS)
  const ods = await dbBridge.addServiceOrder(proj.code, {
    orderNumber: `ODS-${proj.code}-01`,
    type: 'DEMARRAGE',
    title: 'Notification d’ouverture du chantier et accès emprises',
    delayDays: 0,
    costImpact: 0,
  });
  assert('Émission Ordre de Service (ODS)', ods && ods.orderNumber === `ODS-${proj.code}-01`);

  // 5. SITUATION DE TRAVAUX AVEC LIGNES & CALCUL RG (5%) / TVA (19%)
  console.log('\n--- 2. SITUATIONS DE TRAVAUX (AVEC LIGNES DE MÉTRÉ) ---');
  const sit = await dbBridge.addWorkSituation(proj.code, {
    situationNumber: `SIT-${proj.code}-01`,
    amountHT: 12500000,
    lines: [
      { designation: 'Préfabrication spools 6" Sch 80', unit: 'ML', quantity: 240, unitPrice: 25000, totalHT: 6000000 },
      { designation: 'Contrôles Radiographiques RT 100%', unit: 'FORFAIT', quantity: 1, unitPrice: 6500000, totalHT: 6500000 },
    ],
  });
  assert('Création Situation de Travaux avec Lignes', sit && sit.situationNumber === `SIT-${proj.code}-01`);

  // 6. APPROVISIONNEMENTS : FOURNISSEUR HOMOLOGUÉ
  console.log('\n--- 3. ACHATS & APPROVISIONNEMENTS (LIGNES & WORKFLOW) ---');
  const supp = await dbBridge.createSupplier({
    name: `SARL Robinetterie Industrielle d’Algérie #${ts}`,
    contactName: 'Sofiane Brahimi',
    phone: '+213 29 73 00 00',
    email: `contact-${ts}@ria-dz.com`,
    taxId: `0019310294${ts}`,
  });
  assert('Homologation Fournisseur', supp && supp.name.includes('Robinetterie'));

  // 7. DEMANDE D'ACHAT (DA) MULTI-LIGNES
  const pr = await dbBridge.createPurchaseRequest({
    projectId: proj.id,
    projectCode: proj.code,
    category: 'TUYAUTERIE',
    urgency: 'HIGH',
    amountHT: 8400000,
    items: [
      { customName: 'Tubes sans soudure A106 Gr.B 8" Sch 40', quantity: 60, unit: 'ML', unitPrice: 90000 },
      { customName: 'Coudes 90° LR A234 WPB 8"', quantity: 24, unit: 'UNITE', unitPrice: 125000 },
    ],
  });
  assert('Création Demande d’Achat Multi-Lignes', pr && pr.code && (pr.code.startsWith('DA-') || pr.code.includes('2026')));

  // 8. CIRCUIT DE VALIDATION QCD WORKFLOW
  console.log('\n--- 4. WORKFLOWS (APPROBATIONS QCD) ---');
  const workflows = await dbBridge.getWorkflows();
  assert('Vérification Circuit Workflow QCD (DA / Situation)', workflows && workflows.length >= 1);

  const prWf = workflows.find(w => w.type === 'PURCHASE_REQUEST');
  if (prWf) {
    const approvedWf = await dbBridge.approveWorkflow(prWf.id, 'Approuvé par Direction Générale', { name: 'Karim Mansouri', role: 'DIRECTEUR_GENERAL' });
    assert('Approbation Workflow (Génération BC)', approvedWf && approvedWf.status === 'APPROVED');
  }

  // 9. BONS DE COMMANDE (BC)
  const pos = await dbBridge.getPurchaseOrders();
  assert('Présence / Émission Bon de Commande (BC)', pos && pos.length >= 1);

  // 10. STOCKS & MAGASIN (ARTICLES & BONS DE SORTIE)
  console.log('\n--- 5. STOCKS, MAGASINS & BONS DE SORTIE CHANTIER ---');
  const item = await dbBridge.createInventoryItem({
    name: 'Vanne à soupape acier forgé 2" Cl.800',
    category: 'ROBINETTERIE',
    unit: 'UNITE',
    unitCost: 35000,
    currentStock: 50,
  });
  assert('Référencement Article Catalogue', item && (item.name || '').includes('soupape'));

  // Sortie chantier (Bon de Sortie)
  const mvt = await dbBridge.recordStockMovement({
    itemId: item.id,
    type: 'EXIT',
    quantity: 10,
    unitCost: 35000,
    projectId: proj.id,
    deliveryNoteNumber: 'BS-2026-CH-01',
    performedByName: 'Tarek Meziani (Magasinier)',
  });
  assert('Sortie Chantier & Imputation Coût Projet', mvt && (mvt.movementNumber || '').startsWith('MVT-'));

  // 11. RESSOURCES HUMAINES & POINTAGES (AVEC DÉBOURS)
  console.log('\n--- 6. RESSOURCES HUMAINES & POINTAGES CHANTIER ---');
  const emp = await dbBridge.createEmployee({
    firstName: 'Mustapha',
    lastName: 'Cherif',
    title: 'Soudeur Haute Pression TIG 6G',
    contractType: 'CDI',
  });
  assert('Création Collaborateur RH', emp && emp.firstName === 'Mustapha');

  const att = await dbBridge.recordAttendance({
    employeeId: emp.id,
    projectId: proj.id,
    hoursWorked: 8,
    overtimeHours: 2,
    type: 'PRESENT',
  });
  assert('Pointage Journalier & Heures Supplémentaires', att && att.id);

  // 12. PARC, MATÉRIEL & MAINTENANCE
  console.log('\n--- 7. PARC MATÉRIEL & MAINTENANCE ---');
  const asset = await dbBridge.createFleetAsset({
    name: 'Groupe Autonome de Soudage Miller Big Blue 700X',
    type: 'ENGIN',
    brand: 'Miller',
    serialNumber: `SN-MIL-${Date.now()}`,
  });
  assert('Enregistrement Matériel / Engin Parc', asset && (asset.name || '').includes('Miller'));

  const ot = await dbBridge.createMaintenanceOrder({
    assetId: asset.id,
    type: 'PREVENTIVE',
    description: 'Vidange moteur diesel Deutz, remplacement filtres et contrôle générateur',
    estimatedCost: 85000,
  });
  assert('Émission Ordre de Travail (OT) Maintenance', ot && (ot.orderNumber || ot.code));

  // 13. QUALITÉ & QHSE (NON-CONFORMITÉ)
  console.log('\n--- 8. QUALITÉ, CND & NON-CONFORMITÉS ---');
  const nc = await dbBridge.createNonConformity({
    title: 'Inclusion de laitier détectée sur tir radio joint S-04',
    severity: 'MAJEURE',
    projectId: proj.id,
    correctiveAction: 'Gougeage mécanique, meulage et resoudage par soudeur qualifié ASME IX',
  });
  assert('Ouverture Fiche Non-Conformité (FNC)', nc && (nc.ncNumber || nc.code));

  // 14. FINANCE & ENCAISSEMENT CLIENT
  console.log('\n--- 9. FINANCE & TRÉSORERIE ---');
  const pay = await dbBridge.recordPayment({
    projectId: proj.id,
    amount: 14250000,
    paymentReference: 'VIR-BEA-RA1K-2026-08',
    bankName: 'Banque Extérieure d’Algérie (BEA)',
  });
  assert('Encaissement Client & Rapprochement Bancaire', pay && pay.amount === 14250000);

  // 15. AUDIT TRAIL & TRAÇABILITÉ INTÉGRALE
  console.log('\n--- 10. AUDIT TRAIL & TRAÇABILITÉ INTÉGRALE ---');
  const logs = await dbBridge.getAuditLogs();
  assert('Registre d’Audit Présent', Array.isArray(logs) && logs.length > 0);
  assert(`Traçabilité Multi-Entités (${logs.length} événements enregistrés)`, logs.length >= 10);

  console.log('\n========================================');
  console.log(`🎯 SCORE GLOBAL : ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================');

  console.log('\nExtrait des 5 derniers logs de traçabilité enregistrés :');
  logs.slice(0, 5).forEach((l, idx) => {
    console.log(`  [Log #${idx + 1}] ${l.action} | ${l.entityType} | ${l.details || l.description} (${l.timestamp || l.createdAt})`);
  });

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testAll().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
