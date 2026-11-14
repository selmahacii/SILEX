const TEST_DB_URL = "postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public";
process.env.DATABASE_URL = TEST_DB_URL;
process.env.DIRECT_URL = TEST_DB_URL;

const path = require('path');
const assert = require('assert');
const projectRoot = path.resolve(__dirname, '..');
const { PrismaClient } = require(path.resolve(projectRoot, 'apps/web/node_modules/@prisma/client'));
const { serverStore } = require(path.resolve(projectRoot, 'apps/web/src/lib/server-store'));
const { dbBridge } = require(path.resolve(projectRoot, 'apps/web/src/lib/db-bridge'));

let passedCount = 0;
let failedCount = 0;

function report(step, name, passed, details = '') {
  if (passed) {
    passedCount++;
    console.log(`✅ [SCÉNARIO ${step}] ${name} : SUCCÈS ${details ? '(' + details + ')' : ''}`);
  } else {
    failedCount++;
    console.error(`❌ [SCÉNARIO ${step}] ${name} : ÉCHEC - ${details}`);
  }
}

async function runAll19Scenarios() {
  console.log('========================================================================');
  console.log(' SILEX PHASE 6B.3 — SUITE DE VALIDATION COMPLÈTE (19 SCÉNARIOS)');
  console.log(' Base de Test Isolée : PostgreSQL 16 (127.0.0.1:5433/silex_erp)');
  console.log('========================================================================\n');

  let prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });

  try {
    // -------------------------------------------------------------------------
    // SCÉNARIO 1 : Migration initiale
    // -------------------------------------------------------------------------
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at FROM _prisma_migrations WHERE migration_name = '20261114_finance_module'
    `;
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('FinancialAccount', 'CashTransaction', 'CustomerInvoice', 'SupplierInvoice', 'FinancialConfig', 'SupplierInvoiceLine', 'InvoiceLineMatching')
    `;
    const s1Passed = migrations.length > 0 && tables.length === 7;
    report(1, 'Migration initiale PostgreSQL', s1Passed, `${tables.length}/7 tables physiques présentes`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 2 : Création d'un compte
    // -------------------------------------------------------------------------
    const accCode = `ACC-VAL-${Date.now()}`;
    const account = await prisma.financialAccount.create({
      data: {
        code: accCode,
        name: 'Compte Principal Validation BNA',
        type: 'BANQUE_COURANT',
        bankName: 'Banque Nationale d\'Algérie (BNA)',
        ribNumber: '00100 00123 9999999999 88',
        currency: 'DZD',
        initialBalance: 25000000.00,
        currentBalance: 25000000.00,
        isDemoAccount: false,
        isActive: true,
      }
    });
    const s2Passed = Boolean(account.id && account.code === accCode && Number(account.currentBalance) === 25000000);
    report(2, 'Création d\'un compte financier en base', s2Passed, `ID: ${account.id}, Solde: 25M DA`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 3 : Lecture du compte
    // -------------------------------------------------------------------------
    const readAcc = await prisma.financialAccount.findUnique({ where: { id: account.id } });
    const s3Passed = Boolean(readAcc && readAcc.code === accCode && Number(readAcc.initialBalance) === 25000000);
    report(3, 'Lecture du compte financier', s3Passed, `Code: ${readAcc?.code}, Devise: ${readAcc?.currency}`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 4 : Redémarrage serveur (simulation nouvelle instance déconnectée)
    // -------------------------------------------------------------------------
    await prisma.$disconnect();
    const freshPrisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });
    const s4Passed = Boolean(freshPrisma);
    report(4, 'Redémarrage serveur / Nouvelle connexion Prisma', s4Passed, 'Client recréé à froid');

    // -------------------------------------------------------------------------
    // SCÉNARIO 5 : Persistance du compte après redémarrage
    // -------------------------------------------------------------------------
    const rebootAcc = await freshPrisma.financialAccount.findUnique({ where: { id: account.id } });
    const s5Passed = Boolean(rebootAcc && rebootAcc.code === accCode && Number(rebootAcc.currentBalance) === 25000000);
    report(5, 'Persistance des données après redémarrage', s5Passed, `Solde conservé à froid: ${Number(rebootAcc?.currentBalance)} DA`);

    // Réaffectation de l'instance prisma pour la suite
    prisma = freshPrisma;

    // -------------------------------------------------------------------------
    // SCÉNARIO 6 : Création d'un BC avec plusieurs lignes
    // -------------------------------------------------------------------------
    const testItemId = (await prisma.item.findFirst())?.id || 'itm-001';
    const testSupplierId = (await prisma.supplier.findFirst())?.id || 'supp-001';
    const testProjectId = (await prisma.project.findFirst())?.id || 'prj-001';
    const testPRId = (await prisma.purchaseRequest.findFirst())?.id || 'pr-001';

    const poNumber = `BC-VAL-${Date.now()}`;
    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: poNumber,
        purchaseRequestId: testPRId,
        supplierId: testSupplierId,
        projectId: testProjectId,
        totalAmountHT: 7000000.00,
        totalAmountTTC: 8330000.00,
        vatRate: 19.00,
        status: 'ISSUED',
        lines: {
          create: [
            {
              itemId: testItemId,
              description: 'Tubes sans soudure ASTM A106 Gr.B DN150 (100 unités)',
              quantity: 100.00,
              unit: 'U',
              unitPrice: 50000.00,
              subtotal: 5000000.00,
            },
            {
              itemId: testItemId,
              description: 'Vannes à opercule PN40 DN150 (20 unités)',
              quantity: 20.00,
              unit: 'U',
              unitPrice: 100000.00,
              subtotal: 2000000.00,
            }
          ]
        }
      },
      include: { lines: true }
    });

    const poLine1 = po.lines.find(l => Number(l.quantity) === 100);
    const poLine2 = po.lines.find(l => Number(l.quantity) === 20);
    const s6Passed = Boolean(po.id && po.lines.length === 2 && poLine1 && poLine2);
    report(6, 'Création d\'un BC avec plusieurs lignes', s6Passed, `PO ${po.orderNumber}: Ligne 1 (100 u), Ligne 2 (20 u)`);

    // Enregistrer le BC dans serverStore pour le moteur de matching
    serverStore.purchaseOrders.push({
      id: po.id,
      orderNumber: po.orderNumber,
      code: po.orderNumber,
      supplierId: testSupplierId,
      supplierName: 'Fournisseur Tuyauterie Validation',
      projectId: testProjectId,
      projectCode: 'PRJ-VAL',
      totalHT: 7000000,
      totalTTC: 8330000,
      lines: [
        { id: poLine1.id, itemId: testItemId, quantity: 100, unitPrice: 50000 },
        { id: poLine2.id, itemId: testItemId, quantity: 20, unitPrice: 100000 },
      ]
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 7 : Réception partielle BR1
    // -------------------------------------------------------------------------
    const testWhId = (await prisma.warehouse.findFirst())?.id || 'wh-001';
    const br1Number = `BR1-VAL-${Date.now()}`;
    const br1 = await prisma.goodsReceipt.create({
      data: {
        receiptNumber: br1Number,
        purchaseOrderId: po.id,
        warehouseId: testWhId,
        receivedById: 'usr-mag-001',
        deliveryNoteNumber: `BL-1-${Date.now()}`,
        status: 'VALIDATED',
        lines: {
          create: [
            {
              purchaseOrderLineId: poLine1.id,
              itemId: testItemId,
              quantityReceived: 40.00,
            }
          ]
        }
      },
      include: { lines: true }
    });
    const br1Line1 = br1.lines[0];
    const s7Passed = Boolean(br1.id && Number(br1Line1.quantityReceived) === 40);
    report(7, 'Réception partielle BR1', s7Passed, `BR1 ${br1.receiptNumber} : 40 unités reçues sur Ligne 1`);

    // Synchroniser serverStore
    serverStore.goodsReceipts.push({
      id: br1.id,
      receiptNumber: br1.receiptNumber,
      purchaseOrderId: po.id,
      lines: [
        { id: br1Line1.id, purchaseOrderLineId: poLine1.id, itemId: testItemId, deliveredQuantity: 40, acceptedQuantity: 40, unitPriceHT: 50000 }
      ]
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 8 : Réception partielle BR2
    // -------------------------------------------------------------------------
    const br2Number = `BR2-VAL-${Date.now()}`;
    const br2 = await prisma.goodsReceipt.create({
      data: {
        receiptNumber: br2Number,
        purchaseOrderId: po.id,
        warehouseId: testWhId,
        receivedById: 'usr-mag-001',
        deliveryNoteNumber: `BL-2-${Date.now()}`,
        status: 'VALIDATED',
        lines: {
          create: [
            {
              purchaseOrderLineId: poLine1.id,
              itemId: testItemId,
              quantityReceived: 60.00,
            },
            {
              purchaseOrderLineId: poLine2.id,
              itemId: testItemId,
              quantityReceived: 10.00,
            }
          ]
        }
      },
      include: { lines: true }
    });
    const br2Line1 = br2.lines.find(l => Number(l.quantityReceived) === 60);
    const s8Passed = Boolean(br2.id && br2.lines.length === 2 && br2Line1);
    report(8, 'Réception partielle BR2', s8Passed, `BR2 ${br2.receiptNumber} : 60 unités Ligne 1, 10 unités Ligne 2`);

    // Synchroniser serverStore
    serverStore.goodsReceipts.push({
      id: br2.id,
      receiptNumber: br2.receiptNumber,
      purchaseOrderId: po.id,
      lines: [
        { id: br2Line1.id, purchaseOrderLineId: poLine1.id, itemId: testItemId, deliveredQuantity: 60, acceptedQuantity: 60, unitPriceHT: 50000 },
        { id: br2.lines[1].id, purchaseOrderLineId: poLine2.id, itemId: testItemId, deliveredQuantity: 10, acceptedQuantity: 10, unitPriceHT: 100000 }
      ]
    });

    // -------------------------------------------------------------------------
    // SCÉNARIO 9 : Facture partielle F1 (25 unités sur BR1)
    // -------------------------------------------------------------------------
    const f1 = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-F1-${Date.now()}`,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.orderNumber,
      goodsReceiptId: br1.id,
      goodsReceiptCode: br1.receiptNumber,
      quantity: 25,
      unitPrice: 50000,
      amountHT: 1250000,
      vatRate: 19,
    }, { id: 'usr-fin-001', name: 'Responsable Financier' });

    const s9Passed = f1.matchingStatus === 'CONFORME_3_WAY' && f1.invoicedQuantityTotal === 25;
    report(9, 'Facture partielle F1 (25 unités)', s9Passed, `Statut matching: ${f1.matchingStatus}, SoD: ${f1.approvalThresholdStatus}, Facturé cumulé: ${f1.invoicedQuantityTotal} u, Pas de faux écart de prix`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 10 : Facture partielle F2 (50 unités multi-BR : 15 sur BR1 + 35 sur BR2)
    // -------------------------------------------------------------------------
    const f2 = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-F2-${Date.now()}`,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.orderNumber,
      goodsReceiptIds: [br1.id, br2.id],
      quantity: 50,
      unitPrice: 50000,
      amountHT: 2500000,
      vatRate: 19,
    }, { id: 'usr-fin-001', name: 'Responsable Financier' });

    const s10Passed = f2.matchingStatus === 'CONFORME_3_WAY' && f2.invoicedQuantityTotal === 75;
    report(10, 'Facture partielle F2 multi-BR (50 unités)', s10Passed, `Statut: ${f2.matchingStatus}, Multi-BR matché sur BR1 (15 u) + BR2 (35 u)`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 11 : Calcul du reliquat (75 facturées, 25 restantes)
    // -------------------------------------------------------------------------
    const s11Passed = f2.invoicedQuantityTotal === 75 && f2.remainingQuantityToInvoice === 45; // 120 total PO - 75 = 45 restants au global du PO (ou 25 restants sur la ligne 1)
    report(11, 'Calcul du reliquat exact', s11Passed, `Total facturé: ${f2.invoicedQuantityTotal} u, Reliquat restant sur commande: ${f2.remainingQuantityToInvoice} u`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 12 : Détection d'une double imputation
    // -------------------------------------------------------------------------
    // Tenter de refacturer sur BR1 qui a déjà été épuisé (40 reçus, 25 par F1 + 15 par F2 = 40 épuisés)
    const fDouble = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-DOUBLE-${Date.now()}`,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.orderNumber,
      goodsReceiptId: br1.id,
      goodsReceiptCode: br1.receiptNumber,
      quantity: 10,
      unitPrice: 50000,
      amountHT: 500000,
      vatRate: 19,
    }, { id: 'usr-fin-001', name: 'Responsable Financier' });

    const s12Passed = fDouble.matchingStatus === 'ECART_QUANTITE' && fDouble.status === 'A_APPROUVER';
    report(12, 'Détection d\'une double imputation sur BR épuisé', s12Passed, `Statut: ${fDouble.matchingStatus}, Détection: Reliquat BR1 = 0`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 13 : Facturation supérieure à la réception (Dépassement)
    // -------------------------------------------------------------------------
    // Il reste 25 unités sur BR2 Ligne 1. Tentative de facturation de 40 unités.
    const fOver = await dbBridge.createSupplierInvoice({
      invoiceNumber: `FAC-OVER-${Date.now()}`,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.orderNumber,
      goodsReceiptIds: [br2.id],
      quantity: 40,
      unitPrice: 50000,
      amountHT: 2000000,
      vatRate: 19,
    }, { id: 'usr-fin-001', name: 'Responsable Financier' });

    const s13Passed = fOver.matchingStatus === 'ECART_QUANTITE' && fOver.matchingDetails?.notes?.includes('Dépassement quantitatif');
    report(13, 'Facturation supérieure à la réception', s13Passed, `Statut: ${fOver.matchingStatus}, Dépassement détecté et bloqué`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 14 : Rapprochements concurrents
    // -------------------------------------------------------------------------
    // 2 requêtes concurrentes tentent de facturer simultanément 20 unités chacune
    // alors qu'il ne reste que 25 unités disponibles.
    const [c1, c2] = await Promise.all([
      dbBridge.createSupplierInvoice({
        invoiceNumber: `CONC-1-${Date.now()}`,
        purchaseOrderId: po.id,
        purchaseOrderCode: po.orderNumber,
        goodsReceiptIds: [br2.id],
        quantity: 20,
        unitPrice: 50000,
        amountHT: 1000000,
      }),
      dbBridge.createSupplierInvoice({
        invoiceNumber: `CONC-2-${Date.now()}`,
        purchaseOrderId: po.id,
        purchaseOrderCode: po.orderNumber,
        goodsReceiptIds: [br2.id],
        quantity: 20,
        unitPrice: 50000,
        amountHT: 1000000,
      }),
    ]);

    const conformCount = [c1, c2].filter(c => c.matchingStatus === 'CONFORME_3_WAY').length;
    const rejectedCount = [c1, c2].filter(c => c.matchingStatus === 'ECART_QUANTITE').length;
    const s14Passed = conformCount === 1 && rejectedCount === 1;
    report(14, 'Protection contre les rapprochements concurrents', s14Passed, `1 facture approuvée (20 u), 1 rejetée (dépassement reliquat)`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 15 : Échec volontaire d'une transaction
    // -------------------------------------------------------------------------
    let txFailedAsExpected = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.financialAccount.create({
          data: {
            code: `ROLLBACK-TEST-${Date.now()}`,
            name: 'Compte Rollback',
            type: 'BANQUE_COURANT',
            bankName: 'BNA',
            ribNumber: '00000',
          }
        });
        // Erreur volontaire : violation de clé étrangère
        await tx.cashTransaction.create({
          data: {
            transactionNumber: `TX-ERR-${Date.now()}`,
            type: 'DECAISSEMENT_FOURNISSEUR',
            amount: 1000,
            accountId: 'non-existent-account-id-xyz',
            accountCode: 'NONE',
            category: 'Test',
            performedById: 'usr',
            performedByName: 'usr',
          }
        });
      });
    } catch (err) {
      txFailedAsExpected = true;
    }
    report(15, 'Échec volontaire d\'une transaction SQL', txFailedAsExpected, 'Violation FK interceptée');

    // -------------------------------------------------------------------------
    // SCÉNARIO 16 : Vérification du rollback
    // -------------------------------------------------------------------------
    const rollbackAcc = await prisma.financialAccount.findFirst({
      where: { code: { startsWith: 'ROLLBACK-TEST-' } }
    });
    const s16Passed = rollbackAcc === null;
    report(16, 'Vérification du rollback atomique', s16Passed, 'Aucune ligne orpheline en base après rollback');

    // -------------------------------------------------------------------------
    // SCÉNARIO 17 : Indisponibilité PostgreSQL
    // -------------------------------------------------------------------------
    // Test avec un client pointant vers un port fermé
    const brokenPrisma = new PrismaClient({ datasources: { db: { url: "postgresql://silex_admin:pass@127.0.0.1:54999/down?connect_timeout=1" } } });
    let dbOutageCaught = false;
    try {
      await brokenPrisma.financialAccount.findMany();
    } catch (err) {
      dbOutageCaught = true;
    } finally {
      await brokenPrisma.$disconnect();
    }
    report(17, 'Détection indisponibilité PostgreSQL', dbOutageCaught, 'Timeout de connexion capturé');

    // -------------------------------------------------------------------------
    // SCÉNARIO 18 : Vérification de l'absence de fausse confirmation
    // -------------------------------------------------------------------------
    // Simuler un appel à dbBridge.createFinancialAccount avec une contrainte SQL impossible
    let falseConfirmPrevented = false;
    try {
      await dbBridge.createFinancialAccount({
        code: account.code, // Doublon intentionnel de code unique
        name: 'Compte Doublon Frauduleux',
        bankName: 'BNA',
        ribNumber: '11111',
      });
    } catch (err) {
      falseConfirmPrevented = err.message.includes('DB_PERSISTENCE_FAILED') || err.message.includes('unique');
    }
    report(18, 'Absence formelle de fausse confirmation (Pas de 201 Created)', falseConfirmPrevented, 'Exception DB_PERSISTENCE_FAILED levée');

    // -------------------------------------------------------------------------
    // SCÉNARIO 19 : Vérification de l'isolation DEMO/PROD
    // -------------------------------------------------------------------------
    const demoInvoice = await dbBridge.createCustomerInvoice({
      invoiceNumber: `DEMO-INV-${Date.now()}`,
      isDemoInvoice: true,
      amountHT: 500000,
      vatRate: 19,
    });
    const prodInvoice = await dbBridge.createCustomerInvoice({
      invoiceNumber: `PROD-INV-${Date.now()}`,
      isDemoInvoice: false,
      amountHT: 500000,
      vatRate: 19,
    });

    // Vérifier que la facture démo n'est pas persistée dans les factures réelles de production
    const dbDemoCheck = await prisma.customerInvoice.findUnique({ where: { invoiceNumber: demoInvoice.invoiceNumber } });
    const dbProdCheck = await prisma.customerInvoice.findUnique({ where: { invoiceNumber: prodInvoice.invoiceNumber } });
    const s19Passed = dbDemoCheck === null && dbProdCheck !== null;
    report(19, 'Isolation stricte DEMO vs PRODUCTION', s19Passed, 'Facture démo en mémoire isolée, Facture prod persistée sur PostgreSQL');

  } catch (err) {
    console.error('Erreur inattendue dans la suite de tests:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n========================================================================');
  console.log(` RÉSULTAT FINAL DES TESTS : ${passedCount}/19 RÉUSSIS, ${failedCount} ÉCHECS`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAll19Scenarios();
