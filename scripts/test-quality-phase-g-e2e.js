/**
 * TEST E2E PHASE G : QUALITÉ, QHSE, GED TECHNIQUE & WELD BOOK PERSISTANT
 * Conforme aux exigences industrielles SILEX SERVICES ERP (ASME IX / ISO 9606-1 / ISO 9001 / COFREND II)
 */

const assert = require('assert');
const { serverStore } = require('../apps/web/src/lib/server-store');

async function run() {
  console.log('=== TEST E2E PHASE G : QUALITÉ, QHSE, GED & WELD BOOK PERSISTANT ===\n');

  // =========================================================================
  // 1. BIBLIOTHÈQUE DOCUMENTAIRE GED & RÉVISIONS (Section G.1)
  // =========================================================================
  console.log('--- 1. GED Technique, Procédures & Gestion des Révisions ---');

  // 1.1 Consultation des documents qualité initiaux
  const initialDocs = serverStore.getQualityDocuments();
  console.log(`  * Documents qualité en base : ${initialDocs.length}`);
  assert.ok(initialDocs.length >= 5, 'La base doit contenir au minimum 5 documents qualité fondateurs');

  const dmosDoc = initialDocs.find(d => d.category === 'DMOS');
  assert.ok(dmosDoc, 'Un document DMOS doit exister');
  console.log(`    -> Document DMOS trouvé : ${dmosDoc.docNumber} - "${dmosDoc.title}" (v${dmosDoc.version})`);

  // 1.2 Création d'un nouveau document qualité
  console.log('\n  * Dépôt d\'un nouveau document dans la GED...');
  const newDoc = serverStore.createQualityDocument({
    docNumber: 'DOC-2026-099',
    title: 'Procédure d\'épreuve hydraulique sous pression 80 bar hydrotest',
    category: 'PROCEDURE',
    author: 'Karim Mansouri (Chef de Projet)',
    version: '1.0',
    changeNotes: 'Émission initiale pour arrêt Sonatrach RA1K',
  });
  assert.strictEqual(newDoc.docNumber, 'DOC-2026-099');
  assert.strictEqual(newDoc.version, '1.0');
  assert.strictEqual(newDoc.revisions.length, 1);
  console.log(`    -> Document créé : ${newDoc.docNumber} (v${newDoc.version}) avec 1 révision initiale`);

  // 1.3 Incrémentation de révision technique
  console.log('  * Ajout d\'une nouvelle révision technique (v1.1)...');
  const revDoc = serverStore.addQualityDocumentRevision('DOC-2026-099', {
    revision: '1.1',
    changeNotes: 'Ajustement du palier de maintien en pression à 120 minutes',
    author: 'Ingénieur Contrôle CND SILEX',
  });
  assert.strictEqual(revDoc.version, '1.1');
  assert.strictEqual(revDoc.revisions.length, 2);
  assert.strictEqual(revDoc.revisions[1].revision, '1.1');
  console.log(`    -> Révision v1.1 enregistrée, historique complet : ${revDoc.revisions.length} révisions`);

  // =========================================================================
  // 2. WELD BOOK UNITAIRE & TRAÇABILITÉ DES SOUDURES (Section G.2)
  // =========================================================================
  console.log('\n--- 2. Weld Book Unitaire, Traçabilité Métallurgique & Soudures ---');

  // 2.1 Vérification des cordons initiaux tracés
  const initialWelds = serverStore.getWeldJoints();
  console.log(`  * Joints de soudure consignés au Weld Book : ${initialWelds.length}`);
  assert.ok(initialWelds.length >= 5, 'Le Weld Book doit contenir au minimum 5 joints initiaux');

  const j01 = initialWelds.find(w => w.jointNumber === 'J-01-VAP-HP');
  assert.ok(j01, 'Le joint J-01-VAP-HP doit exister');
  assert.strictEqual(j01.welderStamp, 'S-02', 'Le poinçon soudeur doit être S-02');
  assert.strictEqual(j01.material, 'Acier Carbone ASTM A106 Gr.B');
  assert.strictEqual(j01.status, 'LIBERE_EPREUVE');
  console.log(`    -> Joint ${j01.jointNumber} vérifié : Ligne ${j01.lineIso}, Nuance ${j01.material}, Poinçon ${j01.welderStamp}, Statut: ${j01.status}`);

  // 2.2 Consignation d'un nouveau joint soudé
  console.log('\n  * Consignation d\'un nouveau joint soudé au Weld Book...');
  const newJoint = serverStore.createWeldJoint({
    jointNumber: 'J-10-TEST-PHASE-G',
    projectId: 'prj-2026-001',
    lineIso: 'ISO-A106-DN150-SCH80',
    spoolId: 'SPL-04',
    material: 'Acier Carbone ASTM A106 Gr.B',
    diameterNominal: 'DN150 (6")',
    thicknessMm: 11.0,
    heatNumberPipe: 'HEAT-A106-99412',
    welderName: 'Amar Bouzid',
    welderStamp: 'S-02',
    welderCqsRef: 'CQS-BV-2026-088',
    weldingProcess: 'TIG 141 racine + SMAW 111 remplissage',
    dmosRef: 'DMOS-01-ASME-IX',
    weldDate: '2026-11-12',
    status: 'EN_ATTENTE_CND',
  });
  assert.strictEqual(newJoint.jointNumber, 'J-10-TEST-PHASE-G');
  assert.strictEqual(newJoint.status, 'EN_ATTENTE_CND');
  assert.strictEqual(newJoint.heatNumberPipe, 'HEAT-A106-99412');
  console.log(`    -> Joint consigné avec succès : ${newJoint.jointNumber} sur ${newJoint.projectCode} (Statut: ${newJoint.status})`);

  // 2.3 Contrôle CND avec défaut détecté et ouverture automatique de FNC
  console.log('\n  * Enregistrement résultat CND non-conforme avec génération auto d\'une FNC...');
  const countFncBefore = serverStore.getNonConformities().length;
  const inspectedJoint = serverStore.recordWeldCndResult('J-10-TEST-PHASE-G', {
    status: 'A_REPARER',
    type: '100% Ressuage PT + 100% Radio RT',
    cndReportRef: 'RAP-RT-2026-991',
    filmRef: 'FLM-RT-991A',
    controllingBody: 'Bureau Veritas Algérie (COFREND II)',
    defectType: 'Inclusion de laitier linéaire 18mm et manque de fusion en passe de racine',
    autoCreateFnc: true,
  });
  assert.strictEqual(inspectedJoint.status, 'A_REPARER');
  assert.strictEqual(inspectedJoint.cndInspection.status, 'A_REPARER');
  assert.strictEqual(inspectedJoint.cndInspection.filmRef, 'FLM-RT-991A');

  const countFncAfter = serverStore.getNonConformities().length;
  assert.strictEqual(countFncAfter, countFncBefore + 1, 'Une FNC doit avoir été créée automatiquement');
  const autoFnc = serverStore.getNonConformities().find(n => n.weldJointNumber === 'J-10-TEST-PHASE-G');
  assert.ok(autoFnc, 'La FNC auto-générée pour le joint doit exister');
  assert.strictEqual(autoFnc.severity, 'MAJEURE');
  console.log(`    -> Joint ${inspectedJoint.jointNumber} marqué "A_REPARER"`);
  console.log(`    -> FNC auto-générée : ${autoFnc.ncNumber} - "${autoFnc.title}"`);

  // 2.4 Réparation soudure (Gougeage + Réfection) et CND post-réparation
  console.log('\n  * Consignation de la réparation du joint selon DMOS-REP-01...');
  const repairedJoint = serverStore.recordWeldRepair('J-10-TEST-PHASE-G', {
    repairWelderStamp: 'S-02',
    repairDmosRef: 'DMOS-REP-01',
    postRepairCndStatus: 'CONFORME',
    postRepairReportRef: 'RAP-RT-2026-991-R1',
    notes: 'Gougeage complet du cordon défectueux, ressuage intermédiaire blanc, ré-exécution passe TIG sous argon et radio 100% conforme',
  });
  assert.strictEqual(repairedJoint.status, 'REPARE_CONFORME');
  assert.strictEqual(repairedJoint.cndInspection.status, 'CONFORME');
  assert.ok(repairedJoint.repairHistory && repairedJoint.repairHistory.length === 1);
  assert.strictEqual(repairedJoint.repairHistory[0].postRepairCndStatus, 'CONFORME');
  console.log(`    -> Joint réparé avec succès : Statut ${repairedJoint.status}`);
  console.log(`    -> Rapport CND post-réparation : ${repairedJoint.repairHistory[0].postRepairReportRef}`);

  // =========================================================================
  // 3. FICHES DE NON-CONFORMITÉ (FNC) & ACTIONS CAPA (Section G.3)
  // =========================================================================
  console.log('\n--- 3. Fiches de Non-Conformité (FNC), CAPA & Visa de Clôture ---');

  // 3.1 Consultation des FNC initiales
  const fncs = serverStore.getNonConformities();
  const fnc01 = fncs.find(n => n.ncNumber === 'FNC-2026-001');
  assert.ok(fnc01, 'La FNC-2026-001 doit exister');
  assert.strictEqual(fnc01.status, 'CLOSED');
  assert.strictEqual(fnc01.closeType, 'Visa CND Conforme');
  assert.ok(fnc01.actions && fnc01.actions.length >= 2, 'FNC-2026-001 doit comporter ses actions CAPA');
  console.log(`  * FNC-2026-001 vérifiée : Statut ${fnc01.status}, Visa "${fnc01.closeType}", ${fnc01.actions.length} actions CAPA`);

  // 3.2 Ajout d'une action corrective sur la FNC auto-générée
  console.log('\n  * Ajout d\'une action corrective sur la nouvelle FNC...');
  const { action, nonConformity: updatedFnc } = serverStore.addNonConformityAction(autoFnc.id, {
    description: 'Audit du lot d\'électrodes et formation de rappel chambrage envers argon',
    responsible: 'Ingénieur IWE SILEX',
    targetDate: '2026-11-20',
  });
  assert.strictEqual(action.responsible, 'Ingénieur IWE SILEX');
  assert.strictEqual(updatedFnc.status, 'UNDER_INVESTIGATION');
  assert.ok(updatedFnc.actions.some(a => a.id === action.id));
  console.log(`    -> Action corrective enregistrée : "${action.description}" (${action.responsible})`);
  console.log(`    -> Statut FNC passé à : ${updatedFnc.status}`);

  // 3.3 Arbitrage et clôture formelle par visa CND
  console.log('\n  * Arbitrage formel & visa de clôture CND de la FNC...');
  const closedFnc = serverStore.updateNonConformityStatus(autoFnc.id, {
    status: 'CLOSED',
    closeType: 'Visa CND Conforme',
    resolutionNotes: 'Cordon J-10 repris avec succès selon DMOS-REP-01 et validé 100% RT sans aucun défaut.',
  });
  assert.strictEqual(closedFnc.status, 'CLOSED');
  assert.strictEqual(closedFnc.closeType, 'Visa CND Conforme');
  assert.ok(closedFnc.closedBy, 'Le signataire de clôture doit être renseigné');
  assert.ok(closedFnc.closedDate, 'La date de clôture doit être renseignée');
  console.log(`    -> FNC ${closedFnc.ncNumber} clôturée avec visa : ${closedFnc.closeType} par ${closedFnc.closedBy}`);

  console.log('\n=== TOUS LES TESTS E2E PHASE G SONT PASSÉS AVEC SUCCÈS (100%) ===\n');
}

run().catch(err => {
  console.error('\n❌ ÉCHEC DU TEST E2E PHASE G :', err);
  process.exit(1);
});
