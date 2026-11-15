/**
 * TEST E2E PHASE D : MODULE COMMERCIAL, PIPELINE CRM 10 ÉTAPES & CHIFFRAGE COLLABORATIF MULTI-ACTEURS
 * Conforme aux exigences de la PARTIE 5 de l'audit fonctionnel SILEX SERVICES ERP
 */

const assert = require('assert');
const { serverStore } = require('../apps/web/src/lib/server-store');

async function run() {
  console.log('=== TEST E2E PHASE D : MODULE COMMERCIAL, PIPELINE CRM & CHIFFRAGE COLLABORATIF ===\n');

  // =========================================================================
  // 1. PIPELINE CRM INDUSTRIEL À 10 ÉTAPES & RÈGLES DE TRANSITION STRICTES
  // =========================================================================
  console.log('--- 1. Vérification du Pipeline CRM Industriel à 10 Étapes (Section 5.1) ---');
  const opps = serverStore.getOpportunities();
  console.log(`  ✓ Nombre total d'opportunités en registre : ${opps.length}`);
  assert(opps.length >= 3, 'Au moins 3 opportunités baseline doivent exister');

  // Test de transition d'étape normale
  const opp1 = serverStore.getOpportunity('opp-2026-004'); // Nouvelle opportunité Cevital
  assert(opp1, 'L\'opportunité opp-2026-004 doit exister');
  console.log(`  ✓ Opportunité test: ${opp1.code} — "${opp1.title}" (Étape initiale: ${opp1.status}, Proba: ${opp1.winProbability}%)`);

  // Progression vers QUALIFIEE
  const qualifiedOpp = serverStore.updateOpportunityStage(opp1.id, 'QUALIFIEE', {
    notes: 'Besoin client et solvabilité validés lors de la réunion de cadrage.',
  }, { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' });
  assert.strictEqual(qualifiedOpp.status, 'QUALIFIEE');
  assert.strictEqual(qualifiedOpp.winProbability, 20);
  console.log(`  ✓ Passage à QUALIFIEE validé (Proba: ${qualifiedOpp.winProbability}%)`);

  // Progression vers VISITE_TECHNIQUE avec relevé de cotes
  const visitOpp = serverStore.updateOpportunityStage(opp1.id, 'VISITE_TECHNIQUE', {
    siteVisitDate: '2026-11-14',
    technicalReportNotes: 'Relevé contradictoire de tuyauteries vapeur 40 bars en chaufferie.',
    notes: 'Visite contradictoire effectuée par le chef de chantier.',
  }, { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' });
  assert.strictEqual(visitOpp.status, 'VISITE_TECHNIQUE');
  assert.strictEqual(visitOpp.winProbability, 35);
  assert.strictEqual(visitOpp.siteVisitDate, '2026-11-14');
  console.log(`  ✓ Visite technique enregistrée au ${visitOpp.siteVisitDate} (Proba: ${visitOpp.winProbability}%)`);

  // Test de la règle stricte SoD / Critère obligatoire pour étape PERDUE
  console.log('\n  * Test de rejet obligatoire : tentative de passage en PERDUE sans motif...');
  let errorCaught = false;
  try {
    serverStore.updateOpportunityStage(opp1.id, 'PERDUE', {
      lossReason: '', // Motif vide interdit
    });
  } catch (err) {
    errorCaught = true;
    console.log(`    -> Rejet attendu confirmé : "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'Le passage à PERDUE sans motif doit être bloqué');

  // Passage à PERDUE avec motif formel conforme
  const lostOpp = serverStore.updateOpportunityStage(opp1.id, 'PERDUE', {
    lossReason: 'CONCURRENT_MOINS_DISANT',
    notes: 'Concurrent local retenu avec 8% de rabais sur le lot épreuves.',
  }, { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' });
  assert.strictEqual(lostOpp.status, 'PERDUE');
  assert.strictEqual(lostOpp.winProbability, 0);
  assert.strictEqual(lostOpp.lossReason, 'CONCURRENT_MOINS_DISANT');
  console.log(`  ✓ Passage à PERDUE validé avec motif formel : ${lostOpp.lossReason}`);

  // Test de rejet obligatoire pour étape ANNULEE sans motif
  console.log('\n  * Test de rejet obligatoire : tentative de passage en ANNULEE sans motif...');
  errorCaught = false;
  try {
    serverStore.updateOpportunityStage('opp-2026-002', 'ANNULEE', {
      cancellationReason: '   ',
    });
  } catch (err) {
    errorCaught = true;
    console.log(`    -> Rejet attendu confirmé : "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'Le passage à ANNULEE sans motif doit être bloqué');

  // =========================================================================
  // 2. CHIFFRAGE COMMERCIAL MULTI-ACTEURS & CONTRIBUTIONS DÉPARTEMENTALES
  // =========================================================================
  console.log('\n--- 2. Chiffrage Commercial Collaboratif & 4 Contributions Départementales (Section 5.2) ---');
  const sheet = serverStore.getCostSheet('fc-2026-001');
  assert(sheet, 'La fiche baseline FC-2026-001 doit exister');
  console.log(`  ✓ Fiche active: ${sheet.reference} — Client: ${sheet.clientName}`);
  console.log(`    Coût Directs: ${sheet.totalDirectCost.toLocaleString()} DA, Prix Vente HT: ${sheet.proposedSellingPrice.toLocaleString()} DA`);

  // Mise à jour de la contribution PROJET
  console.log('  * Mise à jour de la contribution Projet (Métrés & Durée)...');
  const updatedByPrj = serverStore.updateCostSheetContribution(
    sheet.id,
    'PROJECT',
    {
      worksDescription: 'Dépose tuyauteries, préfabrication 450 ml Inox 316L, 100% CND radio.',
      durationDays: 50,
      technicalMeans: 'Grue mobile 60T, compresseurs 250 bar, 3 postes TIG orbital',
      constraints: 'Zone ATEX 1, arrêt de tranche strict 50 jours',
      lines: [
        { id: 'l-prj-1', category: 'TRAVAUX', label: 'Préfabrication et pose tuyauterie Inox 316L DN150 (450 ml)', quantity: 450, unit: 'ml', unitPrice: 0, totalAmount: 0 },
      ],
    },
    { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' }
  );
  assert.strictEqual(updatedByPrj.projectContribution.durationDays, 50);
  console.log(`  ✓ Durée projet mise à jour : ${updatedByPrj.projectContribution.durationDays} jours`);

  // =========================================================================
  // 3. VERSIONNAGE DES CHIFFRAGES & COMPARATEUR ANALYTIQUE (Section 5.3)
  // =========================================================================
  console.log('\n--- 3. Gestion des Versions de Chiffrage & Comparateur Analytique (Section 5.3) ---');
  const initialVersion = sheet.version;
  console.log(`  ✓ Version actuelle de la fiche : V${initialVersion}.0`);

  // Création de la Révision V(n+1)
  console.log('  * Création d\'une révision formelle V2.0 suite à négociation avec le client...');
  const revisedSheet = serverStore.createCostSheetRevision(
    sheet.id,
    'Négociation client Sonatrach : alignement des cotations métallurgie et rabais accordé sur la location grue.',
    { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' }
  );
  assert.strictEqual(revisedSheet.version, initialVersion + 1, 'Le numéro de version doit être incrémenté de 1');
  assert.strictEqual(revisedSheet.status, 'A_REVISER', 'Le statut doit repasser à A_REVISER');
  assert.strictEqual(revisedSheet.dgDecision, 'PENDING', 'La décision DG doit repasser en PENDING');
  assert(Array.isArray(revisedSheet.revisions), 'Le tableau des révisions archivées doit exister');
  assert.strictEqual(revisedSheet.revisions.length, 1, 'Une révision archivée doit être présente');
  const snapshotV1 = revisedSheet.revisions[0];
  assert.strictEqual(snapshotV1.version, 1, 'Le snapshot archivé doit correspondre à la V1.0');
  console.log(`  ✓ Révision créée : V${revisedSheet.version}.0 (Statut: ${revisedSheet.status})`);
  console.log(`    Snapshot V1 archivé par ${snapshotV1.author} : "${snapshotV1.reason}"`);

  // Ajustement des prix dans la V2 (par exemple rabais de marge à 22% au lieu de 24.5%)
  serverStore.updateCostSheetContribution(
    sheet.id,
    'FINANCE',
    {
      targetMarginPercent: 22,
    },
    { name: 'Réda Bouzid', role: 'RESPONSABLE_FINANCIER' }
  );
  console.log(`  ✓ Nouvelle marge V2.0 appliquée : ${revisedSheet.targetMarginPercent}% (Prix Vente V2: ${revisedSheet.proposedSellingPrice.toLocaleString()} DA)`);

  // Comparateur analytique V1 vs V2
  console.log('\n  * Exécution du Comparateur Analytique V1 vs V2...');
  const comparison = serverStore.compareCostSheetVersions(sheet.id, 1, 2);
  assert(comparison, 'La comparaison doit retourner un résultat');
  console.log(`  ✓ Comparaison ${comparison.reference} :`);
  console.log(`    - Prix Vente V1 : ${comparison.versionA.proposedSellingPrice.toLocaleString()} DA`);
  console.log(`    - Prix Vente V2 : ${comparison.versionB.proposedSellingPrice.toLocaleString()} DA`);
  console.log(`    - Delta Prix    : ${comparison.deltas.deltaSellingPrice.toLocaleString()} DA (${comparison.deltas.deltaSellingPricePct}%)`);
  console.log(`    - Delta Marge % : ${comparison.deltas.deltaTargetMarginPercent}%`);
  assert(typeof comparison.deltas.deltaSellingPrice === 'number', 'Le delta financier doit être calculable');

  // =========================================================================
  // 4. VERROUILLAGE DES FICHES VALIDÉES PAR LA DIRECTION GÉNÉRALE
  // =========================================================================
  console.log('\n--- 4. Règle de Verrouillage des Fiches Validées par la DG ---');
  // Validation DG de la V2
  serverStore.arbitrateCostSheet(
    sheet.id,
    'APPROVED',
    'Offre révisée V2 validée par la Direction Générale suite accord cadre.',
    undefined,
    { name: 'Amine Benali', role: 'DIRECTEUR_GENERAL' }
  );
  assert.strictEqual(sheet.status, 'VALIDEE');
  console.log(`  ✓ Fiche formellement validée par la DG : Statut=${sheet.status}`);

  // Tentative de modification directe de la fiche validée -> DOIT ÊTRE BLOQUÉE
  console.log('  * Test de rejet obligatoire : tentative de modification directe d\'une fiche validée...');
  errorCaught = false;
  try {
    serverStore.updateCostSheetContribution(
      sheet.id,
      'PROJECT',
      { durationDays: 99 },
      { name: 'Karim Mansouri', role: 'RESPONSABLE_PROJET' }
    );
  } catch (err) {
    errorCaught = true;
    console.log(`    -> Rejet attendu confirmé : "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'Toute modification d\'une fiche validée sans création de révision doit échouer');

  console.log('\n================================================================================');
  console.log('RÉSULTAT GLOBAL E2E PHASE D : LE CYCLE COMMERCIAL & CRM EST VALIDÉ À 100% !');
  console.log('================================================================================');
}

run().catch((err) => {
  console.error('\n❌ ECHEC DU TEST E2E PHASE D:', err);
  process.exit(1);
});
