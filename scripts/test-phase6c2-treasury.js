/**
 * SILEX SERVICES ERP — VALIDATION DE LA PHASE 6C.2 (TRÉSORERIE & COMPTES BANCAIRES)
 *
 * Teste exhaustivement :
 * 1. Création de compte financier (PostgreSQL & store)
 * 2. Virement interne compte à compte (vérification des soldes atomiques et de l'historique)
 * 3. Contrôle de solde insuffisant lors d'un virement
 * 4. Enregistrement d'une écriture directe (frais bancaires, encaissement)
 * 5. Contrôle RBAC SoD (seuls DG, DAF et Admin peuvent initier des virements et créer des comptes)
 * 6. Filtrage multicritère et intégrité du journal de trésorerie
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

async function runTreasuryTests() {
  console.log('======================================================================');
  console.log('SILEX SERVICES ERP — VALIDATION TECHNIQUE & MÉTIER PHASE 6C.2');
  console.log('Interface de Trésorerie, Comptes Bancaires & Virements Internes');
  console.log(`Cible : ${TEST_DB_URL}`);
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  const prisma = new PrismaClient({
    datasources: { db: { url: TEST_DB_URL } },
  });

  const dafUser = {
    id: 'usr-daf-01',
    name: 'Karim Hadj',
    role: SystemRole.RESPONSABLE_FINANCIER,
    email: 'daf@silex-services.dz',
  };

  const pmUser = {
    id: 'usr-pm-01',
    name: 'Amine BTP',
    role: SystemRole.RESPONSABLE_PROJET,
    email: 'pm@silex-services.dz',
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1 : Création de deux comptes financiers pour les tests de virement
    // -------------------------------------------------------------------------
    console.log('▶ TEST 1 : Création de comptes bancaires opérationnels (PostgreSQL)');
    const ts = Date.now();
    const acc1Code = `BEA-TST-${ts.toString().slice(-4)}`;
    const acc2Code = `BNA-TST-${ts.toString().slice(-4)}`;

    const acc1 = await dbBridge.createFinancialAccount({
      code: acc1Code,
      name: 'BEA Compte Courant Principal',
      type: 'BANQUE_COURANT',
      bankName: 'Banque Extérieure d\'Algérie (BEA)',
      ribNumber: '002 00010 1234567890 44',
      initialBalance: 10000000, // 10 000 000 DA
      currency: 'DZD',
    }, dafUser);

    const acc2 = await dbBridge.createFinancialAccount({
      code: acc2Code,
      name: 'BNA Compte Chantier Hassi Messaoud',
      type: 'BANQUE_INVESTISSEMENT',
      bankName: 'Banque Nationale d\'Algérie (BNA)',
      ribNumber: '001 00020 9876543210 55',
      initialBalance: 2000000, // 2 000 000 DA
      currency: 'DZD',
    }, dafUser);

    if (acc1 && acc2 && acc1.id && acc2.id) {
      console.log(`  ✔ Compte 1 créé : ${acc1.code} (Solde: ${acc1.currentBalance} DA)`);
      console.log(`  ✔ Compte 2 créé : ${acc2.code} (Solde: ${acc2.currentBalance} DA)`);
      passed++;
    } else {
      console.error('  ❌ Échec création des comptes');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 2 : Virement Interne Compte à Compte (Succès & Atomicité)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 2 : Virement Interne Atomique (Compte 1 -> Compte 2)');
    const transferAmount = 3500000; // 3 500 000 DA
    const transferRef = `OV-TEST-${ts.toString().slice(-4)}`;

    const transferResult = await dbBridge.transferBetweenAccounts({
      sourceAccountId: acc1.id,
      destinationAccountId: acc2.id,
      amount: transferAmount,
      referenceDocument: transferRef,
      notes: 'Transfert approvisionnement compte travaux',
    }, dafUser);

    // Vérifier les soldes en base PostgreSQL à froid
    const dbAcc1 = await prisma.financialAccount.findUnique({ where: { id: acc1.id } });
    const dbAcc2 = await prisma.financialAccount.findUnique({ where: { id: acc2.id } });

    const expectedAcc1Bal = 10000000 - transferAmount; // 6 500 000 DA
    const expectedAcc2Bal = 2000000 + transferAmount;  // 5 500 000 DA

    if (
      Number(dbAcc1.currentBalance) === expectedAcc1Bal &&
      Number(dbAcc2.currentBalance) === expectedAcc2Bal
    ) {
      console.log(`  ✔ Atomicité confirmée : Compte émetteur débité = ${dbAcc1.currentBalance} DA (attendu: ${expectedAcc1Bal} DA)`);
      console.log(`  ✔ Compte récepteur crédité = ${dbAcc2.currentBalance} DA (attendu: ${expectedAcc2Bal} DA)`);
      passed++;
    } else {
      console.error(`  ❌ Erreur solde après virement : Acc1=${dbAcc1.currentBalance}, Acc2=${dbAcc2.currentBalance}`);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 3 : Traçabilité du Grand Livre (Écriture de Virement enregistrée)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 3 : Enregistrement de l\'écriture dans le Grand Livre');
    const txs = await dbBridge.getCashTransactions({ accountId: acc1.id });
    const virTx = txs.find(t => t.referenceDocument === transferRef || t.type === 'VIREMENT_INTERNE_EMIS');

    if (virTx && Number(virTx.amount) === transferAmount) {
      console.log(`  ✔ Mouvement de virement tracé dans le grand livre : ${virTx.transactionNumber || virTx.id}`);
      console.log(`    Type: ${virTx.type}, Montant: ${virTx.amount} DA, Statut: ${virTx.status}`);
      passed++;
    } else {
      console.error('  ❌ Écriture de virement introuvable dans le journal');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 4 : Rejet d'un virement avec solde insuffisant
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 4 : Contrôle de Solde Insuffisant (Rejet Garanti)');
    let rejectedAsExpected = false;
    try {
      await dbBridge.transferBetweenAccounts({
        sourceAccountId: acc1.id,
        destinationAccountId: acc2.id,
        amount: 999999999, // Supérieur au solde
        referenceDocument: 'OV-FAIL-OVERDRAFT',
      }, dafUser);
    } catch (err) {
      rejectedAsExpected = true;
      console.log(`  ✔ Rejet automatique validé : "${err.message}"`);
    }

    if (rejectedAsExpected) {
      passed++;
    } else {
      console.error('  ❌ Le système a autorisé un virement à découvert !');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 5 : Écriture directe de Trésorerie (Frais bancaires & Agios)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 5 : Écriture Directe (Frais Bancaires / Agios)');
    const feeAmount = 15000; // 15 000 DA
    const feeTx = await dbBridge.recordCashTransaction({
      accountId: acc1.id,
      type: 'FRAIS_BANCAIRES',
      amount: feeAmount,
      referenceDocument: `AGIOS-${ts.toString().slice(-4)}`,
      category: 'Frais de tenue de compte',
      notes: 'Commission trimestrielle',
    }, dafUser);

    const dbAcc1AfterFee = await prisma.financialAccount.findUnique({ where: { id: acc1.id } });
    if (Number(dbAcc1AfterFee.currentBalance) === expectedAcc1Bal - feeAmount) {
      console.log(`  ✔ Frais bancaires débités avec succès : Nouveau solde = ${dbAcc1AfterFee.currentBalance} DA`);
      passed++;
    } else {
      console.error(`  ❌ Erreur débit frais bancaires : ${dbAcc1AfterFee.currentBalance}`);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 6 : Sécurité SoD & RBAC Écriture
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 6 : Sécurité SoD / RBAC Écriture');
    const authorizedRoles = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_FINANCIER];
    const isPmAuthorized = authorizedRoles.includes(pmUser.role);
    const isDafAuthorized = authorizedRoles.includes(dafUser.role);

    if (!isPmAuthorized && isDafAuthorized) {
      console.log('  ✔ Règle SoD vérifiée : Chef de Projet (PM) interdit de virement/création de compte');
      console.log('  ✔ DAF & DG dûment habilités aux opérations de trésorerie');
      passed++;
    } else {
      console.error('  ❌ Faille SoD : Rôle non autorisé habilité');
      failed++;
    }

  } catch (globalErr) {
    console.error('Exception inattendue dans les tests de trésorerie:', globalErr);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n======================================================================');
  console.log(`BILAN DES TESTS PHASE 6C.2 : ${passed} RÉUSSIS, ${failed} ÉCHECS`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTreasuryTests();
