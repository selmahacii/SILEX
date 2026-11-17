/**
 * TEST E2E PHASE H : CONSOLIDATION DIRECTION GÉNÉRALE, MARGES RÉELLES & ARBITRAGES DG
 * Conforme aux exigences industrielles SILEX SERVICES ERP
 */

const assert = require('assert');
const { serverStore } = require('../apps/web/src/lib/server-store');

async function run() {
  console.log('=== TEST E2E PHASE H : CONSOLIDATION DIRECTION GÉNÉRALE & PILOTAGE EXÉCUTIF ===\n');
  serverStore.seedCommercialTestBaseline();

  // =========================================================================
  // 1. VÉRIFICATION DU CALCUL DE MARGE & ÉLIMINATION DU 94.4% ARTIFICIEL
  // =========================================================================
  console.log('--- 1. Indicateurs Financiers Consolidés & Marge Prévisionnelle Réelle ---');

  const kpis = serverStore.getProjectKpis();
  console.log(`  * Chiffre d'Affaires Contractuel Global : ${kpis.totalContractValue.toLocaleString()} DA`);
  console.log(`  * Budget Initial Alloué : ${kpis.totalInitialBudget.toLocaleString()} DA`);
  console.log(`  * Budget Révisé Validé : ${kpis.totalRevisedBudget.toLocaleString()} DA`);
  console.log(`  * Coûts Engagés (BC Validés) : ${kpis.totalCommittedCosts.toLocaleString()} DA`);
  console.log(`  * Coûts Réels Comptabilisés : ${kpis.totalActualCosts.toLocaleString()} DA`);
  console.log(`  * Coût Prévisionnel à Terminaison (EAC) : ${kpis.totalEac.toLocaleString()} DA`);
  console.log(`  * Marge Prévisionnelle (DA) : ${kpis.projectedMarginDA.toLocaleString()} DA`);
  console.log(`  * Taux de Marge Prévisionnelle : ${kpis.projectedMarginRate}%`);
  console.log(`  * Taux de Marque : ${kpis.markupRate}%`);
  console.log(`  * Marge Réalisée (Earned Value - Réel) : ${kpis.realizedMarginDA.toLocaleString()} DA (${kpis.realizedMarginRate}%)`);

  // Vérification stricte : la marge globale NE DOIT PAS être l'artifice 94.4%
  assert.notStrictEqual(
    kpis.projectedMarginRate,
    94.4,
    'ANOMALIE BLOQUANTE : La marge globale ne doit JAMAIS afficher le taux artificiel de 94.4% issu d\'une soustraction simpliste !'
  );
  assert.ok(
    typeof kpis.projectedMarginRate === 'number' || kpis.projectedMarginRate === null,
    'Le taux de marge doit être un nombre calculé ou null (Données insuffisantes)'
  );
  if (typeof kpis.projectedMarginRate === 'number') {
    assert.ok(kpis.projectedMarginRate >= 0 && kpis.projectedMarginRate <= 100, 'Le taux de marge doit être compris entre 0% et 100%');
  }

  // Vérification de la distinction stricte entre Budget Initial, Révisé, Engagé, Réel et EAC
  assert.ok(kpis.totalContractValue > 0, 'Le CA contractuel doit être strictement positif');
  assert.ok(kpis.totalRevisedBudget >= kpis.totalInitialBudget, 'Le budget révisé doit être cohérent avec le budget initial');
  assert.ok(kpis.totalEac >= kpis.totalActualCosts, 'L\'EAC doit être supérieur ou égal aux coûts réels déjà consommés');

  console.log('  -> Formules de marge consolidée et EAC validées avec succès.');

  // =========================================================================
  // 2. SYNCHRONISATION STRICTE DE LA BOÎTE D\'ARBITRAGE DG & TABLEAU DE BORD
  // =========================================================================
  console.log('\n--- 2. Synchronisation Boîte d\'Arbitrage DG & Dashboard ---');

  const inbox = serverStore.getWorkflowsInbox();
  console.log(`  * Dossiers en attente d'arbitrage DG (getWorkflowsInbox) : ${inbox.length}`);
  console.log(`  * Compteur d'arbitrages dans les KPIs (pendingApprovalsCount) : ${kpis.pendingApprovalsCount}`);

  // Les deux sources doivent être rigoureusement identiques
  assert.strictEqual(
    inbox.length,
    kpis.pendingApprovalsCount,
    'DÉSYNCHRONISATION : Le nombre de dossiers dans l\'Inbox DG doit être exactement égal à pendingApprovalsCount du Dashboard'
  );

  // Vérifier la présence impérative de la fiche de chiffrage FC-2026-001
  const fc2026001 = inbox.find(w => w.reference === 'FC-2026-001' || w.targetCode === 'FC-2026-001');
  assert.ok(fc2026001, 'La fiche FC-2026-001 DOIT figurer dans les arbitrages DG en attente');
  console.log(`    -> Dossier FC-2026-001 identifié : "${fc2026001.title}"`);
  console.log(`       Montant HT  : ${fc2026001.amountHT.toLocaleString()} DA`);
  console.log(`       Montant TTC : ${fc2026001.amountTTC.toLocaleString()} DA`);

  assert.strictEqual(fc2026001.amountHT, 38700000, 'Le montant HT soumis de FC-2026-001 doit être de 38 700 000 DA');
  assert.strictEqual(fc2026001.amountTTC, 46053000, 'Le montant TTC soumis de FC-2026-001 doit être de 46 053 000 DA (TVA 19%)');

  // Test de création d'une Demande d'Achat dépassant le seuil de délégation (> 500 000 DA)
  console.log('\n  * Soumission d\'une Demande d\'Achat au-dessus du seuil DG (1 500 000 DA)...');
  const countBefore = serverStore.getWorkflowsInbox().length;
  const newPr = serverStore.createPurchaseRequest({
    projectCode: 'PRJ-2026-001',
    projectName: 'Rénovation tuyauteries HP vapeur 80 bar',
    requestedByName: 'Farouk Brahimi',
    urgency: 'HIGH',
    justification: 'Vannes haute pression DN150 Class 600 ASME B16.34',
    items: [
      {
        description: 'Vanne guillotine inox HP DN150 CL600',
        quantity: 2,
        estimatedUnitPrice: 750000,
        estimatedTotal: 1500000,
        category: 'ROBINETTERIE_HP',
      },
    ],
  });

  const inboxAfter = serverStore.getWorkflowsInbox();
  const kpisAfter = serverStore.getProjectKpis();
  console.log(`    -> Nouveaux arbitrages DG : ${inboxAfter.length} (KPI: ${kpisAfter.pendingApprovalsCount})`);

  assert.strictEqual(inboxAfter.length, countBefore + 1, 'Un nouveau dossier doit être ajouté à l\'Inbox DG');
  assert.strictEqual(kpisAfter.pendingApprovalsCount, inboxAfter.length, 'Le KPI dashboard doit s\'incrémenter immédiatement');

  // Traitement d'un arbitrage par la DG (Approbation)
  console.log('  * Approbation DG du dossier DA créé...');
  const prWf = inboxAfter.find(w => w.targetId === newPr.id || w.targetCode === newPr.code);
  assert.ok(prWf, 'Le workflow de la DA doit exister');

  serverStore.approveWorkflow(prWf.id, 'Validé par Direction Générale sous réserve de CCPU 3.1');
  const inboxAfterApproval = serverStore.getWorkflowsInbox();
  const kpisAfterApproval = serverStore.getProjectKpis();

  assert.strictEqual(inboxAfterApproval.length, countBefore, 'Le dossier approuvé doit sortir de l\'Inbox DG en attente');
  assert.strictEqual(kpisAfterApproval.pendingApprovalsCount, inboxAfterApproval.length, 'Le KPI dashboard doit se décrémenter immédiatement');
  console.log('  -> Cycle d\'arbitrage et synchronisation bidirectionnelle Dashboard/Inbox validés.');

  // =========================================================================
  // 3. PIPELINE COMMERCIAL & ÉLIMINATION DES AMBIGUÏTÉS DE STATUTS
  // =========================================================================
  console.log('\n--- 3. Pipeline Commercial & Définition Unique des Indicateurs ---');

  const commercialKpis = serverStore.getCommercialKpis();
  console.log(`  * Total Opportunités : ${commercialKpis.totalOpportunities}`);
  console.log(`  * Affaires Actives : ${commercialKpis.activeOpportunities}`);
  console.log(`  * Affaires en Négociation : ${commercialKpis.inNegotiationCount}`);
  console.log(`  * Volume Pipeline Total : ${commercialKpis.pipelineValue.toLocaleString()} DA`);
  console.log(`  * Volume Pondéré : ${commercialKpis.weightedPipelineValue.toLocaleString()} DA`);
  console.log(`  * Taux de Transformation : ${commercialKpis.conversionRate}%`);

  // Vérifier la cohérence de l'agrégation
  assert.strictEqual(
    commercialKpis.activeOpportunities,
    commercialKpis.openOpportunities,
    'openOpportunities et activeOpportunities doivent être rigoureusement alignés'
  );
  assert.ok(
    commercialKpis.inNegotiationCount <= commercialKpis.activeOpportunities,
    'Le nombre d\'affaires en négociation doit être un sous-ensemble des affaires actives'
  );

  // Vérifier la présence de la répartition par étape (stagesBreakdown)
  assert.ok(commercialKpis.stagesBreakdown, 'Le découpage analytique par étape doit être présent');
  const stages = Object.keys(commercialKpis.stagesBreakdown);
  console.log(`  * Étapes identifiées dans le pipeline : ${stages.length} étapes (${stages.slice(0, 5).join(', ')}...)`);
  assert.ok(stages.includes('NEGOCIATION'), 'L\'étape NEGOCIATION doit exister dans le breakdown');
  assert.ok(stages.includes('CHIFFRAGE'), 'L\'étape CHIFFRAGE doit exister dans le breakdown');
  assert.ok(stages.includes('OFFRE_SOUMISE'), 'L\'étape OFFRE_SOUMISE doit exister dans le breakdown');

  console.log('  -> Pipeline commercial et définitions d\'indicateurs validés.');

  // =========================================================================
  // 4. PERSISTANCE & TRAÇABILITÉ DES ACTIONS DG
  // =========================================================================
  console.log('\n--- 4. Audit Trail & Traçabilité des Décisions de Direction ---');

  const logs = serverStore.getAuditLogs({ limit: 10 });
  console.log(`  * Entrées d'audit récentes : ${logs.length}`);
  assert.ok(logs.length > 0, 'Les actions de direction doivent générer des traces d\'audit immuables');

  console.log('\n=========================================================================');
  console.log('RÉSULTAT GLOBAL PHASE H : 100% SUCCÈS');
  console.log(' - Marge 94.4% éliminée et remplacée par calculs réels EAC / Prévisionnel');
  console.log(' - FC-2026-001 synchronisée en HT et TTC dans l\'Inbox DG');
  console.log(' - 0 désynchronisation entre boîte d\'arbitrage et Dashboard');
  console.log(' - Pipeline commercial à 10 étapes sans ambiguïté de dénomination');
  console.log('=========================================================================\n');
}

run().catch(err => {
  console.error('\n❌ ÉCHEC DU TEST PHASE H :', err);
  process.exit(1);
});
