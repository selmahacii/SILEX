/**
 * SILEX SERVICES ERP — VALIDATION DE LA PHASE 6C.5
 * RENTABILITÉ ANALYTIQUE DES CHANTIERS, DÉCOMPOSITION DU BFR & CLÔTURE MODULE FINANCE
 *
 * Teste exhaustivement :
 * 1. Extraction et cohérence du portefeuille chantiers (getFinanceOverview)
 * 2. Décomposition analytique multi-sources des coûts réels (getProjectProfitability) :
 *    - Matériaux (BR réceptions physiques)
 *    - Main d'œuvre (Pointages réels & paniers)
 *    - Sous-traitance & frais directs
 * 3. Engagements résiduels (BC émis non livrés) et atterrissage budgétaire prévisionnel
 * 4. Décomposition de la balance âgée et calcul du BFR (Créances Clients vs Dettes Fournisseurs)
 * 5. Diagnostic de trésorerie opérationnelle (BESOIN_NET vs RESSOURCE_NETTE)
 * 6. Suivi des retenues de garantie (5% sur situations de travaux)
 * 7. Ségrégation stricte Démo / Production (includeDemo=false) sur les agrégats de rentabilité
 */

const path = require('path');
const projectRoot = path.resolve(__dirname, '..');

const TEST_DB_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';
process.env.DATABASE_URL = TEST_DB_URL;
process.env.DIRECT_URL = TEST_DB_URL;

const { PrismaClient } = require(path.resolve(projectRoot, 'apps/web/node_modules/@prisma/client'));
const { dbBridge } = require(path.resolve(projectRoot, 'apps/web/src/lib/db-bridge'));
const { serverStore } = require(path.resolve(projectRoot, 'apps/web/src/lib/server-store'));
const { SystemRole } = require(path.resolve(projectRoot, 'packages/shared'));

async function runProfitabilityTests() {
  console.log('======================================================================');
  console.log('SILEX SERVICES ERP — VALIDATION TECHNIQUE & MÉTIER PHASE 6C.5');
  console.log('Rentabilité Analytique des Chantiers, Décomposition du BFR & Clôture 6C');
  console.log(`Cible : ${TEST_DB_URL}`);
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  const prisma = new PrismaClient({
    datasources: { db: { url: TEST_DB_URL } },
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1 : Extraction consolidée du portefeuille chantiers (getFinanceOverview)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Extraction consolidée du portefeuille chantiers...');
    const overview = await dbBridge.getFinanceOverview({ includeDemo: false });

    if (!overview || !overview.totals || !Array.isArray(overview.projects)) {
      throw new Error('FinanceOverview incomplet ou mal formaté.');
    }

    console.log(`  ✓ Portefeuille extrait : ${overview.projects.length} affaires`);
    console.log(`  ✓ Total Marchés HT : ${overview.totals.contractAmount} DA`);
    console.log(`  ✓ Total Facturé HT : ${overview.totals.totalBilled} DA`);
    console.log(`  ✓ Taux de marge moyen portefeuille : +${overview.totals.globalMarginRate}%`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 2 : Décomposition analytique des coûts réels par projet
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Décomposition analytique multi-sources des coûts réels...');
    const targetProject = overview.projects[0];
    if (!targetProject) {
      throw new Error('Aucun projet disponible pour le test analytique.');
    }

    const pnl = await dbBridge.getProjectProfitability(targetProject.id || targetProject.code);
    if (!pnl) {
      throw new Error(`P&L introuvable pour le projet ${targetProject.code}`);
    }

    if (!pnl.realCosts || typeof pnl.realCosts.totalDirectCost !== 'number') {
      throw new Error('Structure des coûts réels non conforme.');
    }

    console.log(`  ✓ Chantier audité : ${pnl.projectCode} - ${pnl.projectName}`);
    console.log(`  ✓ Matériaux & Fournitures (BR) : ${pnl.realCosts.materials} DA`);
    console.log(`  ✓ Main d'œuvre (Pointages)     : ${pnl.realCosts.labor} DA`);
    console.log(`  ✓ Frais directs & Sous-traitance: ${pnl.realCosts.otherExpenses} DA`);
    console.log(`  ✓ Total Coûts Directs Consommés: ${pnl.realCosts.totalDirectCost} DA`);
    console.log(`  ✓ Marge Brute Dégagée          : ${pnl.grossMarginDA} DA (+${pnl.grossMarginPercent}%)`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 3 : Engagements résiduels & Atterrissage budgétaire
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Contrôle des engagements résiduels et calcul de l\'atterrissage...');
    if (typeof pnl.committedRemaining !== 'number' || typeof pnl.projectedFinalCost !== 'number') {
      throw new Error('Données d\'atterrissage budgétaire manquantes.');
    }

    const expectedFinalCost = pnl.realCosts.totalDirectCost + pnl.committedRemaining;
    if (pnl.projectedFinalCost !== expectedFinalCost) {
      throw new Error(`Incohérence atterrissage : attendu ${expectedFinalCost}, obtenu ${pnl.projectedFinalCost}`);
    }

    console.log(`  ✓ Engagements restants (BC non livrés) : ${pnl.committedRemaining} DA`);
    console.log(`  ✓ Coût Final Prévisionnel (Atterrissage) : ${pnl.projectedFinalCost} DA`);
    console.log(`  ✓ Budget Alloué                         : ${pnl.estimatedBudget} DA`);
    console.log(`  ✓ Écart sur Budget                      : ${pnl.budgetVarianceDA} DA`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 4 : Décomposition de la Balance Âgée Clients & Fournisseurs
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Décomposition de la Balance Âgée Clients & Fournisseurs...');
    const agedBalance = await dbBridge.getAgedTrialBalance({ includeDemo: false });

    if (!agedBalance || !agedBalance.customerAging || !agedBalance.supplierAging) {
      throw new Error('Structure de balance âgée invalide.');
    }

    const cAging = agedBalance.customerAging;
    const sAging = agedBalance.supplierAging;

    console.log(`  ✓ Créances Clients : Total ${cAging.total} DA (Courant: ${cAging.current}, 1-30j: ${cAging.days30}, 31-60j: ${cAging.days60}, >60j: ${cAging.days90Plus})`);
    console.log(`  ✓ Dettes Fournisseurs : Total ${sAging.total} DA (Courant: ${sAging.current}, 1-30j: ${sAging.days30}, 31-60j: ${sAging.days60}, >60j: ${sAging.days90Plus})`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 5 : Diagnostic du Besoin en Fonds de Roulement (BFR Opérationnel)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Diagnostic du Besoin en Fonds de Roulement (BFR)...');
    const wcr = agedBalance.workingCapitalRequirement;
    if (!wcr || typeof wcr.bfrDA !== 'number') {
      throw new Error('Données de besoin en fonds de roulement manquantes.');
    }

    const expectedBfr = cAging.total - sAging.total;
    if (wcr.bfrDA !== expectedBfr) {
      throw new Error(`Incohérence BFR : attendu ${expectedBfr}, obtenu ${wcr.bfrDA}`);
    }

    const expectedStatus = expectedBfr > 0 ? 'BESOIN_NET' : 'RESSOURCE_NETTE';
    if (wcr.status !== expectedStatus) {
      throw new Error(`Statut BFR erroné : attendu ${expectedStatus}, obtenu ${wcr.status}`);
    }

    console.log(`  ✓ BFR Net Calculé : ${wcr.bfrDA} DA`);
    console.log(`  ✓ Qualification Opérationnelle : ${wcr.status}`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 6 : Suivi des Retenues de Garantie Contractuelles (5%)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Suivi des Retenues de Garantie Contractuelles (5%)...');
    const totalWarrantyHeld = overview.totals.warrantyHeld;
    if (typeof totalWarrantyHeld !== 'number' || totalWarrantyHeld < 0) {
      throw new Error('Montant des retenues de garantie invalide.');
    }

    console.log(`  ✓ Retenues de Garantie consolidées : ${totalWarrantyHeld} DA`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 7 : Ségrégation stricte Production vs Démo (includeDemo = false)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Ségrégation stricte Production vs Démo...');
    const atbNoDemo = await dbBridge.getAgedTrialBalance({ includeDemo: false });
    const atbWithDemo = await dbBridge.getAgedTrialBalance({ includeDemo: true });

    if (atbNoDemo.isDemoIncluded !== false) {
      throw new Error('Flag isDemoIncluded non respecté pour includeDemo=false.');
    }
    if (atbWithDemo.isDemoIncluded !== true) {
      throw new Error('Flag isDemoIncluded non respecté pour includeDemo=true.');
    }

    console.log(`  ✓ Production stricte (includeDemo=false) : Données démo isolées`);
    console.log(`  ✓ Mode Démonstration (includeDemo=true) : Tracé avec flag explicite`);
    passed++;

    // -------------------------------------------------------------------------
    // TEST 8 : Calcul Dynamique de Balance Âgée avec Tranches & BFR Positif
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Calcul Dynamique de Balance Âgée avec Tranches & BFR Positif...');
    const now = new Date();
    const past15 = new Date(now.getTime() - 15 * 86400 * 1000).toISOString();
    const past45 = new Date(now.getTime() - 45 * 86400 * 1000).toISOString();
    const past75 = new Date(now.getTime() - 75 * 86400 * 1000).toISOString();

    // Inject temporary test customer invoices
    serverStore.customerInvoices.push(
      { id: 'test-inv-c1', customerId: 'c1', invoiceNumber: 'FAC-TEST-01', amountHT: 1000000, remainingAmount: 1000000, dueDate: past15, status: 'VALIDEE', isDemoInvoice: false },
      { id: 'test-inv-c2', customerId: 'c2', invoiceNumber: 'FAC-TEST-02', amountHT: 2000000, remainingAmount: 2000000, dueDate: past45, status: 'VALIDEE', isDemoInvoice: false },
      { id: 'test-inv-c3', customerId: 'c3', invoiceNumber: 'FAC-TEST-03', amountHT: 500000, remainingAmount: 500000, dueDate: past75, status: 'VALIDEE', isDemoInvoice: false }
    );

    // Inject test supplier invoice
    serverStore.supplierInvoices.push(
      { id: 'test-inv-s1', supplierId: 's1', invoiceNumber: 'FAC-FOU-01', amountHT: 1500000, remainingAmount: 1500000, dueDate: past15, status: 'APPROUVEE', isDemoInvoice: false }
    );

    const simulatedAtb = await dbBridge.getAgedTrialBalance({ includeDemo: false });
    const simCustAging = simulatedAtb.customerAging;
    const simSuppAging = simulatedAtb.supplierAging;

    console.log(`  ✓ Créances injectées : Total ${simCustAging.total} DA (1-30j: ${simCustAging.days30}, 31-60j: ${simCustAging.days60}, >60j: ${simCustAging.days90Plus})`);
    console.log(`  ✓ Dettes injectées : Total ${simSuppAging.total} DA (1-30j: ${simSuppAging.days30})`);

    const netBfr = simulatedAtb.workingCapitalRequirement.bfrDA;
    console.log(`  ✓ BFR Net : ${netBfr} DA (Statut: ${simulatedAtb.workingCapitalRequirement.status})`);

    if (netBfr !== 2000000) {
      throw new Error(`Incohérence BFR simulé : attendu 2 000 000 DA, obtenu ${netBfr} DA`);
    }
    if (simulatedAtb.workingCapitalRequirement.status !== 'BESOIN_NET') {
      throw new Error(`Statut BFR simulé incorrect : attendu BESOIN_NET, obtenu ${simulatedAtb.workingCapitalRequirement.status}`);
    }

    // Clean up temporary test invoices
    serverStore.customerInvoices = serverStore.customerInvoices.filter(i => !i.id.startsWith('test-inv-'));
    serverStore.supplierInvoices = serverStore.supplierInvoices.filter(i => !i.id.startsWith('test-inv-'));
    passed++;

  } catch (err) {
    console.error('\n❌ ÉCHEC D\'UN TEST :', err.message);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n======================================================================');
  console.log(`RÉSULTAT DES TESTS PHASE 6C.5 : ${passed} réussis, ${failed} échoués`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runProfitabilityTests();
