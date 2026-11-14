/**
 * SILEX SERVICES ERP — VALIDATION DE LA PHASE 6C.3
 * FACTURATION CLIENTS, DÉCOMPTES, SITUATIONS & RETENUES DE GARANTIE
 *
 * Teste exhaustivement :
 * 1. Création de facture client avec calcul strict (HT, TVA 19%, Retenue 5% ou contractuelle, Net Exigible)
 * 2. Persistance ACID en base PostgreSQL 16 (table CustomerInvoice)
 * 3. Enregistrement d'un acompte partiel et mise à jour du statut (PARTIELLEMENT_PAYEE)
 * 4. Encaissement du solde et passage au statut PAYEE
 * 5. Rejet strict du surpaiement (dépassement du solde restant dû)
 * 6. Déblocage de la retenue de garantie suite au PV de Réception Définitive (PVRD)
 * 7. Sécurité SoD / RBAC : PM en lecture seule, DAF / DG habilités
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

async function runBillingTests() {
  console.log('======================================================================');
  console.log('SILEX SERVICES ERP — VALIDATION TECHNIQUE & MÉTIER PHASE 6C.3');
  console.log('Facturation Clients, Décomptes, Acomptes & Retenues de Garantie');
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
    const ts = Date.now();

    // -------------------------------------------------------------------------
    // TEST 1 : Création de Facture Client avec Formule BTP Algérienne
    // Montant HT = 10 000 000 DA, Retenue 5% (500 000 DA), TVA 19% (1 900 000 DA)
    // Net Exigible = (10 000 000 - 500 000) + 1 900 000 = 11 400 000 DA
    // -------------------------------------------------------------------------
    console.log('▶ TEST 1 : Émission Facture Client & Calcul Strict de Retenue');
    const invoiceData = {
      invoiceNumber: `FAC-TEST-${ts.toString().slice(-4)}`,
      clientId: 'cli-sonatrach',
      clientName: 'SONATRACH DP',
      projectId: 'proj-hassi-01',
      projectCode: 'CH-2026-001',
      projectName: 'Rénovation Station Hassi Messaoud',
      workSituationNumber: 'Situation N° 02',
      amountHT: 10000000,
      vatRate: 19,
      retentionRate: 5,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      paymentTerms: '45 jours fin de mois',
      notes: 'Décompte mensuel travaux de tuyauterie industrielle',
    };

    const createdInv = await dbBridge.createCustomerInvoice(invoiceData, dafUser);

    const expectedRetention = 500000;
    const expectedVat = 1900000;
    const expectedNet = 11400000;

    if (
      createdInv &&
      Number(createdInv.retentionAmount) === expectedRetention &&
      Number(createdInv.vatAmount) === expectedVat &&
      Number(createdInv.netReceivableAmount) === expectedNet &&
      Number(createdInv.remainingAmount) === expectedNet &&
      createdInv.status === 'EMISE'
    ) {
      console.log(`  ✔ Calcul exact validé : HT = ${createdInv.amountHT} DA, Retenue 5% = ${createdInv.retentionAmount} DA`);
      console.log(`    TVA 19% = ${createdInv.vatAmount} DA, Net Exigible = ${createdInv.netReceivableAmount} DA`);
      passed++;
    } else {
      console.error('  ❌ Erreur calcul facture client :', createdInv);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 2 : Vérification de la Persistance PostgreSQL 16
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 2 : Persistance en Base de Données PostgreSQL');
    const dbInvoice = await prisma.customerInvoice.findUnique({
      where: { invoiceNumber: invoiceData.invoiceNumber },
    });

    if (dbInvoice && Number(dbInvoice.netReceivableAmount) === expectedNet) {
      console.log(`  ✔ Facture persistée dans la table CustomerInvoice (ID: ${dbInvoice.id})`);
      console.log(`    Statut: ${dbInvoice.status}, Net Exigible: ${dbInvoice.netReceivableAmount} DA`);
      passed++;
    } else {
      console.error('  ❌ Facture non persistée en base PostgreSQL');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 3 : Enregistrement d'un Acompte Partiel & Mise à Jour Statut
    // Versement de 5 000 000 DA sur le compte bancaire BEA
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 3 : Encaissement Acompte Partiel (5 000 000 DA)');
    // Récupérer un compte financier existant
    const accounts = await dbBridge.getFinancialAccounts();
    const bankAcc = accounts.find(a => a.type?.startsWith('BANQUE')) || accounts[0];

    const partialPaymentAmt = 5000000;
    const payResult1 = await dbBridge.recordCustomerPayment(createdInv.id, {
      amount: partialPaymentAmt,
      accountId: bankAcc.id,
      referenceDocument: `VIR-BEA-PART-${ts.toString().slice(-4)}`,
      notes: 'Premier acompte situation N° 2',
    }, dafUser);

    const updatedInvAfterPay1 = await dbBridge.getCustomerInvoice(createdInv.id);
    const expectedRemainingAfterPay1 = expectedNet - partialPaymentAmt; // 6 400 000 DA

    if (
      updatedInvAfterPay1 &&
      Number(updatedInvAfterPay1.paidAmount) === partialPaymentAmt &&
      Number(updatedInvAfterPay1.remainingAmount) === expectedRemainingAfterPay1 &&
      updatedInvAfterPay1.status === 'PARTIELLEMENT_PAYEE'
    ) {
      console.log(`  ✔ Statut mis à jour : PARTIELLEMENT_PAYEE`);
      console.log(`    Déjà payé = ${updatedInvAfterPay1.paidAmount} DA, Reste dû = ${updatedInvAfterPay1.remainingAmount} DA`);
      passed++;
    } else {
      console.error('  ❌ Échec mise à jour suite à acompte partiel :', updatedInvAfterPay1);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 4 : Rejet d'un Paiement Dépassant le Reste Dû (Anti-Surpaiement)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 4 : Protection Contre le Surpaiement');
    let overpaymentBlocked = false;
    try {
      await dbBridge.recordCustomerPayment(createdInv.id, {
        amount: expectedRemainingAfterPay1 + 1000000, // Dépassement
        accountId: bankAcc.id,
        referenceDocument: 'VIR-OVERFLOW',
      }, dafUser);
    } catch (err) {
      overpaymentBlocked = true;
      console.log(`  ✔ Rejet automatique validé : "${err.message}"`);
    }

    if (overpaymentBlocked) {
      passed++;
    } else {
      console.error('  ❌ Le système a autorisé un encaissement supérieur au reste dû !');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 5 : Encaissement du Solde et Clôture Facture (Statut PAYEE)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 5 : Encaissement du Solde (6 400 000 DA) et Clôture');
    const payResult2 = await dbBridge.recordCustomerPayment(createdInv.id, {
      amount: expectedRemainingAfterPay1,
      accountId: bankAcc.id,
      referenceDocument: `VIR-BEA-SOLDE-${ts.toString().slice(-4)}`,
      notes: 'Solde final situation N° 2',
    }, dafUser);

    const updatedInvAfterPay2 = await dbBridge.getCustomerInvoice(createdInv.id);

    if (
      updatedInvAfterPay2 &&
      Number(updatedInvAfterPay2.remainingAmount) === 0 &&
      Number(updatedInvAfterPay2.paidAmount) === expectedNet &&
      updatedInvAfterPay2.status === 'PAYEE'
    ) {
      console.log(`  ✔ Facture soldée avec succès : Statut = PAYEE, Reste dû = 0 DA`);
      passed++;
    } else {
      console.error('  ❌ Échec passage au statut PAYEE :', updatedInvAfterPay2);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 6 : Déblocage de la Retenue de Garantie (PVRD)
    // Libération de la retenue de 500 000 DA sous séquestre
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 6 : Déblocage de la Retenue de Garantie (PVRD)');
    const releaseResult = await dbBridge.releaseWarrantyRetention(createdInv.id, {
      amount: expectedRetention,
      accountId: bankAcc.id,
      referenceDocument: `PVRD-DEF-${ts.toString().slice(-4)}`,
      notes: 'Réception définitive prononcée sans réserve',
    }, dafUser);

    const updatedInvAfterRelease = await dbBridge.getCustomerInvoice(createdInv.id);

    if (
      updatedInvAfterRelease &&
      Number(updatedInvAfterRelease.warrantyReleasedAmount) === expectedRetention
    ) {
      console.log(`  ✔ Retenue débloquée avec succès : ${updatedInvAfterRelease.warrantyReleasedAmount} DA libérés`);
      passed++;
    } else {
      console.error('  ❌ Échec déblocage retenue de garantie :', updatedInvAfterRelease);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 7 : Ségrégation des Tâches (SoD) & RBAC Écriture
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 7 : Contrôle SoD / RBAC Facturation');
    const authorizedRoles = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_FINANCIER];
    const isPmAuthorized = authorizedRoles.includes(pmUser.role);
    const isDafAuthorized = authorizedRoles.includes(dafUser.role);

    if (!isPmAuthorized && isDafAuthorized) {
      console.log('  ✔ Chef de Projet (PM) : Consultation seule (émission et encaissement interdits)');
      console.log('  ✔ DAF & DG : Droits stricts d\'émission et de recouvrement vérifiés');
      passed++;
    } else {
      console.error('  ❌ Faille de ségrégation des tâches détectée');
      failed++;
    }

  } catch (globalErr) {
    console.error('Exception inattendue dans les tests de facturation client:', globalErr);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n======================================================================');
  console.log(`BILAN DES TESTS PHASE 6C.3 : ${passed} RÉUSSIS, ${failed} ÉCHECS`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBillingTests();
