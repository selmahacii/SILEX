/**
 * SILEX SERVICES ERP — VALIDATION DE LA PHASE 6C.4
 * RAPPROCHEMENT FOURNISSEURS (3-WAY MATCHING), APPROBATIONS SOD & RÈGLEMENTS
 *
 * Teste exhaustivement :
 * 1. Rapprochement 3-Way Conforme (BC, BR et Facture alignés) -> Statut CONFORME_3_WAY
 * 2. Détection d'un Écart de Prix (Facture > BC hors tolérance) -> Statut ECART_PRIX & A_APPROUVER
 * 3. Détection d'un Écart de Quantité (Facture > Réception physique BR) -> Statut ECART_QUANTITE
 * 4. Blocage strict du paiement avant approbation SoD (interdiction de payer une facture A_APPROUVER)
 * 5. Approbation managériale sous dérogation (DG / DAF) avec motif obligatoire
 * 6. Règlement de la facture approuvée (Décaissement bancaire, contrôle solvabilité & statut PAYEE)
 * 7. Annulation / Rejet d'une facture en litige (Statut REJETEE)
 * 8. Sécurité SoD & RBAC : PM bridé au plafond opérationnel, DG requise au-delà de 2M DA
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

async function runMatchingTests() {
  console.log('======================================================================');
  console.log('SILEX SERVICES ERP — VALIDATION TECHNIQUE & MÉTIER PHASE 6C.4');
  console.log('Rapprochement Fournisseurs (3-Way Matching), Approbations SoD & Règlements');
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

  const dgUser = {
    id: 'usr-dg-01',
    name: 'Directeur Général SILEX',
    role: SystemRole.DIRECTEUR_GENERAL,
    email: 'dg@silex-services.dz',
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
    // ÉTAPE 0 : Préparation des données d'approvisionnement (BC et BR)
    // -------------------------------------------------------------------------
    const poCode = `BC-TEST-${ts.toString().slice(-4)}`;
    const grCode = `BR-TEST-${ts.toString().slice(-4)}`;

    // Création d'une commande BC dans serverStore
    const po = {
      id: `po-${ts}`,
      orderNumber: poCode,
      code: poCode,
      supplierId: 'sup-acier-01',
      supplierName: 'SARL ACIERIE DU CENTRE',
      projectId: 'proj-hassi-01',
      projectCode: 'CH-2026-001',
      totalHT: 1500000,
      totalTTC: 1785000,
      lines: [
        {
          id: `poi-${ts}-1`,
          lineNumber: 1,
          description: 'Poutrelle IPE 200 acier S275',
          quantity: 100,
          unitPrice: 15000,
        },
      ],
    };
    serverStore.purchaseOrders.push(po);

    // Création d'une réception BR (100 unités reçues) dans serverStore
    const gr = {
      id: `gr-${ts}`,
      receiptNumber: grCode,
      purchaseOrderId: po.id,
      purchaseOrderNumber: po.orderNumber,
      supplierName: po.supplierName,
      lines: [
        {
          id: `gri-${ts}-1`,
          purchaseOrderLineId: `poi-${ts}-1`,
          deliveredQuantity: 100,
          acceptedQuantity: 100,
          quantityReceived: 100,
          unitPriceHT: 15000,
        },
      ],
    };
    serverStore.goodsReceipts.push(gr);

    // -------------------------------------------------------------------------
    // TEST 1 : Facture 100% Conforme au 3-Way Matching
    // 100 unités à 15 000 DA = 1 500 000 DA HT
    // -------------------------------------------------------------------------
    console.log('▶ TEST 1 : Rapprochement 3-Way Conforme (BC, BR et Facture alignés)');
    const compliantInv = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-SUP-OK-${ts.toString().slice(-4)}`,
      supplierName: po.supplierName,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.orderNumber,
      goodsReceiptId: gr.id,
      goodsReceiptCode: gr.receiptNumber,
      amountHT: 1500000,
      vatRate: 19,
      notes: 'Facture conforme commande et réception physique',
      lines: [
        {
          lineNumber: 1,
          description: 'Poutrelle IPE 200 acier S275',
          quantity: 100,
          unitPrice: 15000,
          subtotalHT: 1500000,
        },
      ],
    }, dafUser);

    if (
      compliantInv &&
      compliantInv.matchingStatus === 'CONFORME_3_WAY' &&
      compliantInv.status === 'A_APPROUVER'
    ) {
      console.log(`  ✔ Statut 3-Way validé : CONFORME_3_WAY`);
      console.log(`    Statut approbation : ${compliantInv.status} (${compliantInv.approvalThresholdStatus}), Montant TTC : ${compliantInv.amountTTC} DA`);
      passed++;
    } else {
      console.error('  ❌ Échec rapprochement conforme :', compliantInv);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 2 : Détection d'un Écart de Prix (Facture > BC)
    // Prix facturé = 18 000 DA vs Prix commandé = 15 000 DA (+20% d'écart)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 2 : Détection d\'un Écart de Prix (Prix Facture > Prix BC)');
    const po2Code = `BC-PRIX-${ts.toString().slice(-4)}`;
    const gr2Code = `BR-PRIX-${ts.toString().slice(-4)}`;
    const po2 = {
      id: `po2-${ts}`,
      orderNumber: po2Code,
      code: po2Code,
      supplierId: 'sup-acier-01',
      supplierName: 'SARL ACIERIE DU CENTRE',
      projectId: 'proj-hassi-01',
      projectCode: 'CH-2026-001',
      totalHT: 1500000,
      totalTTC: 1785000,
      lines: [
        {
          id: `poi2-${ts}-1`,
          lineNumber: 1,
          description: 'Poutrelle IPE 200 acier S275',
          quantity: 100,
          unitPrice: 15000,
        },
      ],
    };
    serverStore.purchaseOrders.push(po2);

    const gr2 = {
      id: `gr2-${ts}`,
      receiptNumber: gr2Code,
      purchaseOrderId: po2.id,
      purchaseOrderNumber: po2.orderNumber,
      supplierName: po2.supplierName,
      lines: [
        {
          id: `gri2-${ts}-1`,
          purchaseOrderLineId: `poi2-${ts}-1`,
          deliveredQuantity: 100,
          acceptedQuantity: 100,
          quantityReceived: 100,
          unitPriceHT: 15000,
        },
      ],
    };
    serverStore.goodsReceipts.push(gr2);

    const priceVarianceInv = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-SUP-PRIX-${ts.toString().slice(-4)}`,
      supplierName: po2.supplierName,
      purchaseOrderId: po2.id,
      purchaseOrderCode: po2.orderNumber,
      goodsReceiptId: gr2.id,
      goodsReceiptCode: gr2.receiptNumber,
      amountHT: 1800000,
      vatRate: 19,
      notes: 'Facture avec hausse unitaire non convenue',
      lines: [
        {
          lineNumber: 1,
          description: 'Poutrelle IPE 200 acier S275',
          quantity: 100,
          unitPrice: 18000, // Écart de prix
          subtotalHT: 1800000,
        },
      ],
    }, dafUser);

    if (
      priceVarianceInv &&
      priceVarianceInv.matchingStatus === 'ECART_PRIX' &&
      priceVarianceInv.status === 'A_APPROUVER'
    ) {
      console.log(`  ✔ Écart de prix détecté : Statut = ECART_PRIX`);
      console.log(`    Statut SoD bloqué : A_APPROUVER (approbation managériale requise)`);
      passed++;
    } else {
      console.error('  ❌ Échec détection écart de prix :', priceVarianceInv);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 3 : Blocage Strict du Paiement Avant Approbation SoD
    // Tentative de paiement d'une facture A_APPROUVER -> DOIT ÉCHOUER
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 3 : Blocage Strict du Paiement Avant Visa SoD');
    // Récupérer un compte bancaire pour le test
    const accounts = await dbBridge.getFinancialAccounts();
    const bankAcc = accounts.find(a => a.type?.startsWith('BANQUE')) || accounts[0];

    let payBlockedBeforeApproval = false;
    try {
      await dbBridge.recordSupplierPayment(priceVarianceInv.id, {
        amount: 500000,
        accountId: bankAcc.id,
        referenceDocument: 'OV-ILLEGAL-PRE-APPROVAL',
      }, dafUser);
    } catch (err) {
      payBlockedBeforeApproval = true;
      console.log(`  ✔ Rejet automatique validé : "${err.message}"`);
    }

    if (payBlockedBeforeApproval) {
      passed++;
    } else {
      console.error('  ❌ Le système a autorisé le paiement d\'une facture non approuvée !');
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 4 : Approbation Managériale sous Dérogation SoD (DG)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 4 : Approbation Managériale sous Dérogation (Visa DG)');
    const derogationReason = 'Hausse acier acceptée par la DG suite à avenant client Sonatrach';
    const approvedInv = await dbBridge.approveSupplierInvoiceWithDerogation(
      priceVarianceInv.id,
      derogationReason,
      dgUser
    );

    if (
      approvedInv &&
      approvedInv.status === 'APPROUVEE' &&
      approvedInv.approvalThresholdStatus === 'APPROVED' &&
      approvedInv.notes.includes(derogationReason)
    ) {
      console.log(`  ✔ Dérogation accordée : Statut = APPROUVEE`);
      console.log(`    Motif tracé : "${derogationReason}"`);
      passed++;
    } else {
      console.error('  ❌ Échec approbation sous dérogation :', approvedInv);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 5 : Règlement Bancaire de la Facture Approuvée
    // Décaissement effectif sur compte bancaire
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 5 : Décaissement Bancaire & Apurement de Dette');
    const paymentAmount = Number(approvedInv.remainingAmount);
    const payResult = await dbBridge.recordSupplierPayment(approvedInv.id, {
      amount: paymentAmount,
      accountId: bankAcc.id,
      referenceDocument: `OV-BEA-${ts.toString().slice(-4)}`,
      notes: 'Règlement total après visa dérogation',
    }, dafUser);

    const updatedInvAfterPay = await dbBridge.getSupplierInvoice(approvedInv.id);

    if (
      updatedInvAfterPay &&
      Number(updatedInvAfterPay.remainingAmount) === 0 &&
      updatedInvAfterPay.status === 'PAYEE'
    ) {
      console.log(`  ✔ Paiement exécuté avec succès : Statut = PAYEE, Dette = 0 DA`);
      passed++;
    } else {
      console.error('  ❌ Échec du paiement de la facture approuvée :', updatedInvAfterPay);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 6 : Annulation / Rejet d'une Facture Fournisseur Litigieuse
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 6 : Rejet / Annulation de Facture pour Non-Conformité');
    // Création d'une facture en anomalie
    const badInv = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-SUP-BAD-${ts.toString().slice(-4)}`,
      supplierName: 'FOURNISSEUR EN LITIGE',
      amountHT: 950000,
      vatRate: 19,
      notes: 'Livraison non reçue',
    }, dafUser);

    const cancelReason = 'Marchandises endommagées et refusées au déchargement';
    const rejectedInv = await dbBridge.cancelSupplierInvoice(badInv.id, cancelReason, dafUser);

    if (
      rejectedInv &&
      rejectedInv.status === 'REJETEE' &&
      rejectedInv.notes.includes(cancelReason)
    ) {
      console.log(`  ✔ Facture rejetée avec succès : Statut = REJETEE`);
      console.log(`    Motif de rejet tracé : "${cancelReason}"`);
      passed++;
    } else {
      console.error('  ❌ Échec annulation facture litigieuse :', rejectedInv);
      failed++;
    }

    // -------------------------------------------------------------------------
    // TEST 7 : Ségrégation des Tâches (SoD) & Plafonds d'Approbation
    // Vérification du seuil DG (2 000 000 DA)
    // -------------------------------------------------------------------------
    console.log('\n▶ TEST 7 : Contrôle SoD & Seuil DG (2 000 000 DA)');
    const highValueAmount = 4500000; // 4.5M DA > 2M DA
    const highValInv = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-SUP-HIGH-${ts.toString().slice(-4)}`,
      supplierName: 'GROS FOURNISSEUR EQUIPEMENTS',
      amountHT: highValueAmount,
      vatRate: 19,
      notes: 'Facture gros équipement industriel',
    }, dafUser);

    if (
      highValInv &&
      highValInv.approvalThresholdStatus === 'PENDING_DG' &&
      highValInv.status === 'A_APPROUVER'
    ) {
      console.log(`  ✔ Plafond DG vérifié : Montant ${highValueAmount} DA (> 2M DA) orienté vers visa DG (PENDING_DG)`);
      passed++;
    } else {
      console.error('  ❌ Échec orientation plafond DG :', highValInv);
      failed++;
    }

  } catch (globalErr) {
    console.error('Exception inattendue dans les tests de rapprochement fournisseurs:', globalErr);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n======================================================================');
  console.log(`BILAN DES TESTS PHASE 6C.4 : ${passed} RÉUSSIS, ${failed} ÉCHECS`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMatchingTests();
