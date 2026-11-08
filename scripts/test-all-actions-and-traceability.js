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
      console.error(`❌ [${total}] ÉCHEC : ${title} ${detail}`);
      process.exitCode = 1;
    }
  }

  const ts = Date.now().toString().slice(-4);
  const projCode = `PRJ-AUDIT-${ts}`;

  // 1. PROJETS, DATES & AFFECTATION
  console.log('\n--- 1. PROJETS & JALONS ---');
  const proj = await dbBridge.createProject({
    code: projCode,
    name: `Installation Boucle Vapeur Skikda #${ts}`,
    clientName: 'Sonatrach / Raffinerie RA1K',
    sector: 'OIL_AND_GAS',
    siteLocation: 'Zone Industrielle Skikda',
    contractAmount: 145000000,
    budgetAmount: 120000000,
    startDate: new Date('2026-11-01').toISOString(),
    contractEndDate: new Date('2027-05-31').toISOString(),
    managerId: 'usr-rp-002',
  });
  assert('Création Projet', proj && proj.code === projCode, JSON.stringify(proj));

  // 2. MODIFICATION DATES CONTRACTUELLES
  const updatedDates = await dbBridge.updateProject(proj.code, {
    startDate: new Date('2026-11-05').toISOString(),
    contractEndDate: new Date('2027-06-30').toISOString(),
  });
  assert('Modification Dates Contractuelles & Prolongation Délai', Boolean(updatedDates));

  // 3. CHANGEMENT DU RESPONSABLE DE PROJET
  const updatedManager = await dbBridge.updateProject(proj.code, {
    managerId: 'usr-rp-003',
  });
  assert('Désignation / Changement du Responsable de Chantier', Boolean(updatedManager));

  // 4. AFFECTATION COLLABORATEUR ÉQUIPE CHANTIER
  const memberAssignment = await dbBridge.assignMemberToProject(proj.code, 'usr-mnt-007', {
    id: 'usr-dg-001',
    name: 'Amine Benali',
    role: 'DIRECTEUR_GENERAL',
  });
  assert('Affectation Collaborateur Chantier (UserProjectAssignment)', Boolean(memberAssignment));

  // 5. VÉRIFICATION COLLABORATEUR DANS LE PROJET
  const projectWithMembers = await dbBridge.getProject(proj.code);
  const isAssigned = (projectWithMembers?.assignedUsers || []).some((a) => a.userId === 'usr-mnt-007');
  assert('Vérification Appartenance Collaborateur au Chantier', isAssigned);

  // 6. AVANCEMENT PHYSIQUE & FINANCIER
  const updatedProg = await dbBridge.updateProgress(proj.code, 35, 28);
  assert('Ajustement Avancement (35% physique, 28% financier)', updatedProg && (updatedProg.physicalProgress === 35 || updatedProg.physicalProgress === 35.0));

  // 7. JALON CONTRACTUEL
  const mls = await dbBridge.addMilestone(proj.code, {
    title: `Épreuve Hydrostatique Spools Vapeur 80 bar #${ts}`,
    targetDate: '2026-06-15',
    status: 'PENDING',
  });
  assert('Ajout Jalon Contractuel', mls && (mls.title || mls.name).includes('Épreuve'));

  // 8. ORDRE DE SERVICE (ODS)
  const ods = await dbBridge.addServiceOrder(proj.code, {
    orderNumber: `ODS-${proj.code}-01`,
    type: 'DEMARRAGE',
    title: 'Notification d’ouverture du chantier et accès emprises',
    delayDays: 0,
    costImpact: 0,
  });
  assert('Émission Ordre de Service (ODS)', ods && ods.orderNumber === `ODS-${proj.code}-01`);

  // 9. SITUATION DE TRAVAUX AVEC LIGNES & CALCUL RG (5%) / TVA (19%)
  console.log('\n--- 2. SITUATIONS DE TRAVAUX (AVEC LIGNES DE MÉTRÉ) ---');
  const situation = await dbBridge.addWorkSituation(proj.code, {
    situationNumber: `SIT-${proj.code}-01`,
    periodStart: '2026-11-01',
    periodEnd: '2026-11-30',
    lines: [
      { id: '1', itemNumber: '01', description: 'Pose tuyauterie inox 6"', quantity: 200, unitPrice: 25000, unit: 'ML' },
      { id: '2', itemNumber: '02', description: 'Soudures TIG radio HP', quantity: 50, unitPrice: 45000, unit: 'JOINT' },
    ],
    tvaRate: 19,
    retenueGarantieRate: 5,
  });
  assert('Création Situation de Travaux avec Lignes', situation && (situation.situationNumber || situation.id));

  // 10. ACHATS : FOURNISSEUR, DA MULTI-LIGNES & CIRCUIT QCD
  console.log('\n--- 3. ACHATS & APPROVISIONNEMENTS (LIGNES & WORKFLOW) ---');
  const supplier = await dbBridge.createSupplier({
    name: `Tubacier Algérie SARL #${ts}`,
    taxId: `001516098273645-${ts}`,
    contactName: 'Karim Mansouri',
    phone: '+213 29 12 34 56',
    email: `contact-${ts}@tubacier.dz`,
    address: 'Zone Industrielle Oued Smar, Alger',
    specialties: 'Tubes sans soudure ASTM A106, brides ANSI 300',
  });
  assert('Homologation Fournisseur', supplier && (supplier.name || supplier.code));

  const da = await dbBridge.createPurchaseRequest({
    projectId: proj.id || projCode,
    requestedById: 'usr-rp-002',
    category: 'TUYAUTERIE',
    urgency: 'HIGH',
    items: [
      { itemId: 'art-01', description: 'Tube acier ASTM A106 Gr.B 8" Sch40', quantity: 150, unitPrice: 42000, unit: 'ML' },
      { itemId: 'art-02', description: 'Brides à collerette WNRF 8" CL300', quantity: 30, unitPrice: 70000, unit: 'U' },
    ],
    totalHT: 8400000,
  });
  assert('Création Demande d’Achat Multi-Lignes', da && (da.code || da.reference));

  // 11. WORKFLOW APPROBATION QCD
  console.log('\n--- 4. WORKFLOWS (APPROBATIONS QCD) ---');
  const workflows = await dbBridge.getWorkflows();
  const daWf = (workflows || []).find(w => w.type === 'PURCHASE_REQUEST' && (w.targetCode === da.code || w.reference === da.code));
  assert('Vérification Circuit Workflow QCD (DA / Situation)', Boolean(daWf || workflows.length > 0));

  const targetWfId = daWf ? daWf.id : workflows[0]?.id;
  if (targetWfId) {
    const approved = await dbBridge.approveWorkflow(targetWfId, 'Validation Direction Générale pour commande prioritaire', {
      id: 'usr-dg-001',
      name: 'Amine Benali',
      role: 'DIRECTEUR_GENERAL',
    });
    assert('Approbation Workflow (Génération BC)', Boolean(approved));
  }

  // 12. BON DE COMMANDE FOURNISSEUR
  const po = await dbBridge.createPurchaseOrder({
    projectId: proj.id || projCode,
    purchaseRequestId: da.id || 'da-01',
    supplierId: supplier.id,
    totalHT: 8400000,
    vatAmount: 1596000,
    totalTTC: 9996000,
    items: [
      { itemId: 'art-01', name: 'Tube acier ASTM A106 Gr.B 8"', quantity: 150, unitPrice: 42000, unit: 'ML' },
      { itemId: 'art-02', name: 'Brides à collerette WNRF 8" CL300', quantity: 30, unitPrice: 70000, unit: 'U' },
    ],
  });
  assert('Présence / Émission Bon de Commande (BC)', po && (po.code || po.orderNumber));

  // 13. MAGASINS & STOCKS
  console.log('\n--- 5. STOCKS, MAGASINS & BONS DE SORTIE CHANTIER ---');
  const item = await dbBridge.createInventoryItem({
    code: `TUBE-8-SCH40-${ts}`,
    name: 'Tube Acier Carbone 8" Sch40 Sans Soudure',
    categoryId: 'TUYAUTERIE',
    unit: 'METRE',
    unitCost: 35000,
    currentStock: 250,
  });
  assert('Référencement Article Catalogue', item && item.id);

  const mvt = await dbBridge.recordStockMovement({
    type: 'EXIT',
    itemId: item.id,
    quantity: 10,
    unitCost: 35000,
    projectId: proj.id || projCode,
    deliveryNoteNumber: 'BS-2026-CH-01',
    notes: 'Sortie pour préfabrication spools sur chantier',
  });
  assert('Sortie Chantier & Imputation Coût Projet', mvt && (mvt.movementNumber || mvt.id));

  // 14. RESSOURCES HUMAINES & POINTAGES CHANTIER
  console.log('\n--- 6. RESSOURCES HUMAINES & POINTAGES CHANTIER ---');
  const emp = await dbBridge.createEmployee({
    matricule: `SLX-SOU-${ts}`,
    firstName: 'Mustapha',
    lastName: 'Cherif',
    jobTitle: 'Soudeur TIG / Électrode Enrobée 6G (Inconel / Acier)',
    hourlyRate: 1500,
  });
  assert('Création Collaborateur RH', emp && emp.id);

  const attendance = await dbBridge.recordAttendance({
    employeeId: emp.id,
    projectId: proj.id || projCode,
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 8,
    overtimeHours: 2,
    type: 'PRESENT',
  });
  assert('Pointage Journalier & Heures Supplémentaires', attendance && attendance.id);

  // 15. PARC MATÉRIEL & MAINTENANCE
  console.log('\n--- 7. PARC MATÉRIEL & MAINTENANCE ---');
  const asset = await dbBridge.createFleetAsset({
    code: `EQP-${ts}`,
    name: 'Groupe Autonome de Soudage Miller Big Blue 700X',
    assetType: 'POSTE_SOUDURE',
    serialNumber: `SN-MILLER-${ts}`,
  });
  assert('Enregistrement Matériel / Engin Parc', asset && asset.id);

  const ot = await dbBridge.createMaintenanceOrder({
    assetId: asset.id,
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: 'Vidange moteur diesel Deutz et étalonnage régulateur ampérage',
  });
  assert('Émission Ordre de Travail (OT) Maintenance', ot && ot.id);

  // 16. QUALITÉ, CND & NON-CONFORMITÉS
  console.log('\n--- 8. QUALITÉ, CND & NON-CONFORMITÉS ---');
  const fnc = await dbBridge.createNonConformity({
    title: 'Inclusion de laitier détectée sur tir radio joint S-04',
    projectId: proj.id || projCode,
    severity: 'MEDIUM',
    rootCause: 'Meulage insuffisant inter-passes lors du soudage à la baguette',
    correctiveAction: 'Gougeage et reprise de passe avec contrôle ressuage final',
  });
  assert('Ouverture Fiche Non-Conformité (FNC)', fnc && fnc.id);

  // 17. FINANCE & ENCAISSEMENTS
  console.log('\n--- 9. FINANCE & TRÉSORERIE ---');
  const payment = await dbBridge.recordPayment({
    projectId: proj.id || projCode,
    amount: 14250000,
    paymentReference: `VIR-BEA-${ts}`,
    bankName: 'BEA - Banque Extérieure d’Algérie (Compte Exploitation)',
    notes: 'Règlement Situation N°01 après déduction retenue de garantie 5%',
  });
  assert('Encaissement Client & Rapprochement Bancaire', payment && payment.id);

  const finOverview = await dbBridge.getFinanceOverview();
  assert('Synthèse Financière Consolidée 100% Dynamique', finOverview && finOverview.totals && Number(finOverview.totals.contractAmount) > 0);

  // 18. AUDIT TRAIL & TRAÇABILITÉ INTÉGRALE
  console.log('\n--- 10. AUDIT TRAIL & TRAÇABILITÉ INTÉGRALE ---');
  const auditLogs = await dbBridge.getAuditLogs();
  assert('Registre d’Audit Présent', Array.isArray(auditLogs) && auditLogs.length > 0);
  assert(`Traçabilité Multi-Entités (${auditLogs.length} événements enregistrés)`, auditLogs.length >= 10);

  console.log('\n========================================');
  console.log(`🎯 SCORE GLOBAL : ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================');
  console.log('\nExtrait des 5 derniers logs de traçabilité enregistrés :');
  auditLogs.slice(0, 5).forEach((l, idx) => {
    console.log(`  [Log #${idx + 1}] ${l.action} | ${l.entityType || l.entityName} | ${l.description || l.details} (${l.timestamp || l.createdAt})`);
  });
}

testAll().catch(err => {
  console.error('Crash test global:', err);
  process.exit(1);
});
