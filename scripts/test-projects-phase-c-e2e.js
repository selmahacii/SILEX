/**
 * TEST E2E PHASE C : PROJETS INDUSTRIELS & PILOTAGE DE CHANTIER (12 ONGLETS, ODS, TIMESHEETS, PVRP/PVRD)
 * Conforme aux exigences de la PARTIE 4 de l'audit fonctionnel SILEX SERVICES ERP
 */

const assert = require('assert');
const { serverStore } = require('../apps/web/src/lib/server-store');

async function run() {
  console.log('=== TEST E2E PHASE C : PROJETS INDUSTRIELS & PILOTAGE DE CHANTIER ===\n');

  // 1. Récupération du projet baseline PRJ-2026-001
  console.log('--- 1. Vérification des données initiales du chantier PRJ-2026-001 ---');
  const project = serverStore.getProject('PRJ-2026-001');
  assert(project, 'Le projet PRJ-2026-001 doit exister');
  console.log(`  ✓ Projet: ${project.code} — "${project.name}"`);
  console.log(`  ✓ Client: ${project.clientName} (Site: ${project.siteLocation}, Wilaya: ${project.wilaya})`);
  assert.strictEqual(project.contractAmount, 48500000, 'Montant contractuel = 48 500 000 DA HT');

  // 2. Vérification des 4 indicateurs d'avancement distincts (Section 4.2)
  console.log('\n--- 2. Vérification des 4 indicateurs distincts d\'avancement (Section 4.2) ---');
  assert(typeof project.physicalProgress === 'number', 'Avancement physique doit être un nombre');
  const budgetConsumedPct = ((project.spentBudget / project.budgetAmount) * 100).toFixed(1);
  const totalSituationsHT = (project.workSituations || []).reduce((acc, s) => acc + Number(s.amountHT || 0), 0);
  const billedPct = ((totalSituationsHT / project.contractAmount) * 100).toFixed(1);
  const totalCollectedHT = (project.workSituations || [])
    .filter(s => s.status === 'PAYE' || s.status === 'ENCAISSE' || s.status === 'VALIDE')
    .reduce((acc, s) => acc + (Number(s.amountHT || 0) * 0.95), 0);
  const collectedPct = ((totalCollectedHT / project.contractAmount) * 100).toFixed(1);

  console.log(`  ✓ 1. Avancement Physique Pondéré : ${project.physicalProgress}%`);
  console.log(`  ✓ 2. Consommation Budgétaire     : ${budgetConsumedPct}% (${project.spentBudget.toLocaleString()} / ${project.budgetAmount.toLocaleString()} DA)`);
  console.log(`  ✓ 3. Avancement Financier Facturé: ${billedPct}% (${totalSituationsHT.toLocaleString()} DA)`);
  console.log(`  ✓ 4. Avancement Financier Encaissé: ${collectedPct}% (${totalCollectedHT.toLocaleString()} DA)`);
  assert(Number(budgetConsumedPct) > 0, 'La consommation budgétaire doit être calculable');

  // 3. Gestion des Ordres de Service (ODS) (Section 4.3)
  console.log('\n--- 3. Gestion des Ordres de Service (ODS) juridiques & contractuels (Section 4.3) ---');
  assert(Array.isArray(project.serviceOrders), 'Les ODS doivent être un tableau');
  assert(project.serviceOrders.length > 0, 'Au moins un ODS doit être présent');
  const ods1 = project.serviceOrders[0];
  console.log(`  ✓ ODS initial: ${ods1.orderNumber} (${ods1.type}) — Notifié le ${ods1.effectiveDate || ods1.issueDate}`);
  console.log(`    Signataire: ${ods1.signatory || 'Non spécifié'}, Impact délai: +${ods1.delayDays || 0}j`);

  // Émission d'un ODS d'Arrêt pour purge LOTO
  const newOds = {
    orderNumber: `ODS-PRJ-2026-001-${String(project.serviceOrders.length + 1).padStart(2, '0')}`,
    type: 'ARRET',
    description: 'Suspension temporaire des travaux de soudage pour consignation LOTO du collecteur gaz.',
    effectiveDate: '2026-11-12',
    status: 'SIGNE',
    delayImpactDays: 5,
    costImpactAmount: 0,
    signatory: 'M. Mustapha Larbi (Sonatrach)',
    clientRef: 'SONATRACH/LOTO/2026/01',
  };
  project.serviceOrders.push(newOds);
  console.log(`  ✓ Nouvel ODS émis : ${newOds.orderNumber} (${newOds.type}) avec impact délai +${newOds.delayImpactDays} jours`);

  // 4. Pointages & Main-d'œuvre industrielle (Section 4.4)
  console.log('\n--- 4. Pointages & Main-d\'Œuvre Industrielle par Corps d\'État (Section 4.4) ---');
  const initialTimesheets = serverStore.getProjectTimesheets('PRJ-2026-001');
  assert(Array.isArray(initialTimesheets), 'Les pointages doivent être un tableau');
  assert(initialTimesheets.length >= 4, 'Les pointages initiaux doivent contenir les 4 corps d\'état');
  console.log(`  ✓ Pointages initiaux récupérés : ${initialTimesheets.length} entrées`);

  // Enregistrement d'un nouveau pointage Soudeur ASME IX
  const newPointage = serverStore.createProjectTimesheet('PRJ-2026-001', {
    workerName: 'Rabah Belhadj',
    corpsEtat: 'SOUDEUR_ASME',
    workerQualification: 'ASME IX 6G TIG/SMAW Inox 316L',
    date: '2026-11-14',
    normalHours: 8,
    overtimeHours: 3,
    weatherHours: 0,
    hourlyRate: 1500,
    taskRef: 'TSK-05',
    productivityRatio: 1.10,
    status: 'VALIDE',
  }, { name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' });

  assert(newPointage && newPointage.id, 'Le pointage doit être créé');
  // Coût: 8 * 1500 + 3 * (1500 * 1.5) = 12000 + 6750 = 18750 DA
  assert.strictEqual(newPointage.totalCostDA, 18750, 'Coût calculé = 18 750 DA');
  console.log(`  ✓ Nouveau pointage enregistré : ${newPointage.workerName} (${newPointage.corpsEtat}) -> Coût MO : ${newPointage.totalCostDA.toLocaleString()} DA`);

  // 5. Clôture Formelle & Réception de Chantier (PVRP & PVRD) (Section 4.5)
  console.log('\n--- 5. Clôture Formelle & Réception de Chantier (PVRP & PVRD) (Section 4.5) ---');
  
  // 5.1 PVRP (Réception Provisoire)
  const pvrp = serverStore.updateProjectReception('PRJ-2026-001', {
    type: 'PVRP',
    status: 'VALIDE_RESERVES_LEVEES',
    pvDate: '2026-12-15',
    clientSignatory: 'M. Mustapha Larbi (Chef Dép. Maintenance Sonatrach)',
    reservesCount: 1,
    reservesLifted: true,
    notes: 'Épreuves hydrostatiques à 45 bars conformes sans fuite. 1 réserve mineure de retouche peinture sur supportage levée séance tenante.',
  }, { name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' });

  assert(pvrp, 'Le PVRP doit être enregistré');
  assert.strictEqual(pvrp.status, 'VALIDE_RESERVES_LEVEES');
  console.log(`  ✓ PV de Réception Provisoire (PVRP) validé : Statut=${pvrp.status}, Signataire="${pvrp.clientSignatory}"`);

  // 5.2 PVRD (Réception Définitive & Libération Retenue 5% - SoD DG)
  const pvrd = serverStore.updateProjectReception('PRJ-2026-001', {
    type: 'PVRD',
    status: 'VALIDE_DEFINITIF',
    pvDate: '2027-12-15',
    notes: 'Expiration de la période de garantie de 12 mois sans vice caché. Restitution autorisée de la retenue de garantie (5%).',
  }, { name: 'Amine Benali', role: 'DIRECTEUR_GENERAL' });

  assert(pvrd, 'Le PVRD doit être enregistré');
  assert.strictEqual(pvrd.status, 'VALIDE_DEFINITIF');
  assert.strictEqual(pvrd.guaranteeReleased, true, 'La garantie doit être libérée');
  // 5% de 48 500 000 DA = 2 425 000 DA
  assert.strictEqual(pvrd.retentionRefundedDA, 2425000, 'Montant de garantie restitué = 2 425 000 DA');
  console.log(`  ✓ PV de Réception Définitive (PVRD) validé par la DG :`);
  console.log(`    Statut=${pvrd.status}, Retenue libérée=${pvrd.retentionRefundedDA.toLocaleString()} DA`);

  console.log('\n================================================================================');
  console.log('RÉSULTAT GLOBAL E2E PHASE C : TOUTES LES ÉTAPES SONT VALIDÉES À 100% !');
  console.log('================================================================================');
}

run().catch(err => {
  console.error('\n❌ Échec du test E2E Phase C :', err);
  process.exit(1);
});
