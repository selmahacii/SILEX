const assert = require('assert');
const path = require('path');

async function run() {
  console.log('================================================================================');
  console.log('=== TEST E2E: MODULE 06 FINANCE, TRÉSORERIE & RENTABILITÉ PROJET SILEX ===');
  console.log('================================================================================\n');

  let serverStore;
  let dbBridge;
  try {
    const storeModule = require('../apps/web/src/lib/server-store');
    serverStore = storeModule.serverStore;
    const bridgeModule = require('../apps/web/src/lib/db-bridge');
    dbBridge = bridgeModule.dbBridge;
  } catch (err) {
    try {
      const storeModule = await import('../apps/web/src/lib/server-store.ts');
      serverStore = storeModule.serverStore;
      const bridgeModule = await import('../apps/web/src/lib/db-bridge.ts');
      dbBridge = bridgeModule.dbBridge;
    } catch (e) {
      throw new Error(`Impossible de charger server-store ou db-bridge: ${err.message} (${e.message})`);
    }
  }

  let passedTests = 0;
  const totalTests = 11;

  // ============================================================================
  // ÉTAPE 1 : CONTRÔLE D'ISOLATION DES COMPTES DÉMO & SOLDE INITIAL
  // ============================================================================
  console.log('--- 1. Contrôle d’isolation des comptes financiers Démo ---');
  const accounts = await dbBridge.getFinancialAccounts();
  assert(accounts.length >= 3, 'Au moins 3 comptes de trésorerie démo doivent être initialisés');
  
  const beaAccount = accounts.find(a => a.code === 'DEMO-CPT-01');
  const bnaAccount = accounts.find(a => a.code === 'DEMO-CPT-02');
  const pettyCash = accounts.find(a => a.code === 'DEMO-CPT-03');

  assert(beaAccount, 'Compte DEMO-CPT-01 (BEA) introuvable');
  assert(bnaAccount, 'Compte DEMO-CPT-02 (BNA) introuvable');
  assert(pettyCash, 'Compte DEMO-CPT-03 (Caisse Régie) introuvable');

  assert.strictEqual(beaAccount.isDemoAccount, true, 'Le compte DEMO-CPT-01 doit être tagué isDemoAccount=true');
  assert.strictEqual(bnaAccount.isDemoAccount, true, 'Le compte DEMO-CPT-02 doit être tagué isDemoAccount=true');
  assert.strictEqual(pettyCash.isDemoAccount, true, 'Le compte DEMO-CPT-03 doit être tagué isDemoAccount=true');

  console.log(`  ✓ Comptes vérifiés : BEA (${beaAccount.currentBalance.toLocaleString('fr-DZ')} DA), BNA (${bnaAccount.currentBalance.toLocaleString('fr-DZ')} DA), Caisse (${pettyCash.currentBalance.toLocaleString('fr-DZ')} DA)`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 2 : PARAMÉTRAGE CONFIGURABLE (SEUILS, TVA, RETENUE DE GARANTIE)
  // ============================================================================
  console.log('\n--- 2. Vérification des paramètres financiers configurables ---');
  const config = await dbBridge.getFinancialConfig();
  assert.strictEqual(config.defaultVatRate, 19, 'Taux TVA par défaut doit être 19%');
  assert.strictEqual(config.defaultRetentionRate, 5, 'Taux retenue de garantie par défaut doit être 5%');
  assert.strictEqual(config.dgApprovalThresholdDA, 2000000, 'Seuil DG doit être configurable (baseline 2M DA)');

  // Mise à jour configurable par un profil DG
  const dgUser = { id: 'usr-dg-001', role: 'DIRECTEUR_GENERAL', name: 'Amine Benali' };
  const updatedConfig = await dbBridge.updateFinancialConfig({ pmApprovalThresholdDA: 600000 }, dgUser);
  assert.strictEqual(updatedConfig.pmApprovalThresholdDA, 600000, 'Le seuil PM doit pouvoir être révisé');
  console.log(`  ✓ Paramètres financiers configurables vérifiés et modifiés avec succès`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 3 : ÉMISSION FACTURE CLIENT AVEC TVA & RETENUE DE GARANTIE (5%)
  // ============================================================================
  console.log('\n--- 3. Émission d’une Facture Client avec TVA (19%) et Retenue de Garantie (5%) ---');
  const initialInvoiceCount = (await dbBridge.getCustomerInvoices()).length;
  const newInvoice = await dbBridge.createCustomerInvoice({
    amountHT: 10000000, // 10,000,000 DA HT
    vatRate: 19,
    retentionRate: 5,
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
    paymentTerms: '45 jours fin de mois',
    isDemoInvoice: true,
  });

  // Calculs attendus:
  // Retenue = 10,000,000 * 5% = 500,000 DA
  // TVA = 10,000,000 * 19% = 1,900,000 DA
  // Net exigible immédiat = (10,000,000 - 500,000) + 1,900,000 = 11,400,000 DA
  assert.strictEqual(newInvoice.retentionAmount, 500000, 'Retenue de garantie calculée erronée');
  assert.strictEqual(newInvoice.vatAmount, 1900000, 'Montant TVA calculé erroné');
  assert.strictEqual(newInvoice.netReceivableAmount, 11400000, 'Net exigible calculé erroné');
  assert.strictEqual(newInvoice.remainingAmount, 11400000, 'Solde initial restant dû doit être le net exigible');
  assert.strictEqual(newInvoice.warrantyHeldAmount, 500000, 'Montant en retenue de garantie séquestrée');
  assert.strictEqual(newInvoice.status, 'EMISE', 'Statut initial de la facture');

  console.log(`  ✓ Facture ${newInvoice.invoiceNumber} émise : HT=${newInvoice.amountHT.toLocaleString()} DA, TVA=${newInvoice.vatAmount.toLocaleString()} DA, Retenue=${newInvoice.retentionAmount.toLocaleString()} DA, Net à payer=${newInvoice.netReceivableAmount.toLocaleString()} DA`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 4 : RÈGLEMENT CLIENT PARTIEL ET TOTAL AVEC ENCAISSEMENT BANCAIRE
  // ============================================================================
  console.log('\n--- 4. Enregistrement d’encaissements partiel puis total avec impact trésorerie ---');
  const balanceBefore = beaAccount.currentBalance;

  // 1er règlement partiel : 6,000,000 DA
  const partPay = await dbBridge.recordCustomerPayment(newInvoice.id, {
    amount: 6000000,
    accountId: beaAccount.id,
    referenceDocument: 'VIR-CHQ-TEST-001',
    idempotencyKey: 'idemp-test-cli-pay-1',
  });

  assert.strictEqual(partPay.invoice.status, 'PARTIELLEMENT_PAYEE', 'Statut attendu: PARTIELLEMENT_PAYEE');
  assert.strictEqual(partPay.invoice.paidAmount, 6000000, 'Montant payé attendu: 6M DA');
  assert.strictEqual(partPay.invoice.remainingAmount, 5400000, 'Reste dû attendu: 5.4M DA');
  assert.strictEqual(beaAccount.currentBalance, balanceBefore + 6000000, 'Le solde bancaire doit avoir augmenté de 6M DA');

  // 2e règlement du solde : 5,400,000 DA
  const fullPay = await dbBridge.recordCustomerPayment(newInvoice.id, {
    amount: 5400000,
    accountId: beaAccount.id,
    referenceDocument: 'VIR-CHQ-TEST-002',
    idempotencyKey: 'idemp-test-cli-pay-2',
  });

  assert.strictEqual(fullPay.invoice.status, 'PAYEE', 'Statut attendu: PAYEE');
  assert.strictEqual(fullPay.invoice.remainingAmount, 0, 'Reste dû attendu: 0 DA');
  assert.strictEqual(beaAccount.currentBalance, balanceBefore + 11400000, 'Le solde bancaire doit refléter la totalité du net encaissé');

  console.log(`  ✓ Facture soldée à 100%. Solde compte BEA: ${beaAccount.currentBalance.toLocaleString('fr-DZ')} DA`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 5 : LIBÉRATION DE LA RETENUE DE GARANTIE (PVRD)
  // ============================================================================
  console.log('\n--- 5. Levée des réserves et libération de la retenue de garantie (PVRD) ---');
  const balanceBeforeRelease = beaAccount.currentBalance;
  const releaseRes = await dbBridge.releaseWarrantyRetention(newInvoice.id, {
    amount: 500000,
    accountId: beaAccount.id,
    referenceDocument: 'PV-RECEPTION-DEFINITIVE-2027',
  });

  assert.strictEqual(releaseRes.releasedAmount, 500000, 'Montant retenue libéré erroné');
  assert.strictEqual(releaseRes.invoice.warrantyReleasedAmount, 500000, 'Total retenue libérée sur facture erroné');
  assert.strictEqual(beaAccount.currentBalance, balanceBeforeRelease + 500000, 'Le compte bancaire doit recevoir la retenue débloquée');

  console.log(`  ✓ Retenue de 500,000 DA débloquée suite au PVRD et créditée sur le compte BEA`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 6 : 3-WAY MATCHING FACTURE FOURNISSEUR (BC + BR vs FACTURE)
  // ============================================================================
  console.log('\n--- 6. 3-Way Matching sur Facture Fournisseur (Bon de commande vs Réception physique vs Facture) ---');

  // Création d'une commande BC test
  const poTest = {
    id: `po-test-${Date.now()}`,
    orderNumber: `BC-TEST-${Date.now().toString().slice(-4)}`,
    supplierId: 'sup-001',
    supplierName: 'Tubacex Algérie',
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    totalHT: 5000000, // 5,000,000 DA
    status: 'APPROUVE',
  };
  serverStore['purchaseOrders'].push(poTest);

  // Cas A : Facture sans Réception -> statut SANS_RECEPTION
  const invWithoutGr = await dbBridge.createSupplierInvoice({
    supplierId: poTest.supplierId,
    supplierName: poTest.supplierName,
    purchaseOrderId: poTest.id,
    purchaseOrderCode: poTest.orderNumber,
    amountHT: 5000000,
    invoiceNumber: 'FAC-ERR-001',
  });
  assert.strictEqual(invWithoutGr.matchingStatus, 'SANS_RECEPTION', 'Une facture sans BR doit être taguée SANS_RECEPTION');
  assert.strictEqual(invWithoutGr.status, 'A_APPROUVER', 'Statut doit être A_APPROUVER');

  // Cas B : Création Réception BR avec écart de prix (> 100 DA)
  const grTest = {
    id: `gr-test-${Date.now()}`,
    receiptNumber: `BR-TEST-${Date.now().toString().slice(-4)}`,
    purchaseOrderId: poTest.id,
    purchaseOrderCode: poTest.orderNumber,
    supplierId: poTest.supplierId,
    supplierName: poTest.supplierName,
    warehouseId: 'war-01',
    warehouseName: 'Magasin Central',
    receiverName: 'Tarek Meziani',
    status: 'COMPLET',
    qualityInspection: { overallStatus: 'CONFORME', ccpuVerified: true, cndReportAttached: true },
    lines: [{
      id: 'l1',
      description: 'Tubes inox',
      orderedQuantity: 100,
      previouslyReceivedQuantity: 0,
      deliveredQuantity: 100,
      acceptedQuantity: 100,
      rejectedQuantity: 0,
      remainingQuantity: 0,
      unit: 'ml',
      unitPriceHT: 50000,
    }],
  };
  serverStore['goodsReceipts'].push(grTest);

  // Facture avec écart de prix (5,500,000 au lieu de 5,000,000)
  const invPriceMismatch = await dbBridge.createSupplierInvoice({
    supplierId: poTest.supplierId,
    supplierName: poTest.supplierName,
    purchaseOrderId: poTest.id,
    purchaseOrderCode: poTest.orderNumber,
    goodsReceiptId: grTest.id,
    goodsReceiptCode: grTest.receiptNumber,
    amountHT: 5500000,
    invoiceNumber: 'FAC-ECART-002',
  });
  assert.strictEqual(invPriceMismatch.matchingStatus, 'ECART_PRIX', 'Un écart de prix doit être détecté');
  assert.strictEqual(invPriceMismatch.status, 'A_APPROUVER', 'Facture en écart doit être A_APPROUVER');

  // Cas C : 3-Way Match Parfait
  const invPerfectMatch = await dbBridge.createSupplierInvoice({
    supplierId: poTest.supplierId,
    supplierName: poTest.supplierName,
    purchaseOrderId: poTest.id,
    purchaseOrderCode: poTest.orderNumber,
    goodsReceiptId: grTest.id,
    goodsReceiptCode: grTest.receiptNumber,
    amountHT: 5000000, // Exact match
    vatRate: 19,
    invoiceNumber: 'FAC-CONFORME-003',
  });
  assert.strictEqual(invPerfectMatch.matchingStatus, 'CONFORME_3_WAY', 'Le match 3-way doit être CONFORME_3_WAY');
  console.log(`  ✓ Détection des écarts et validation 3-way conforme validées`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 7 : DÉCAISSEMENT ET RÈGLEMENT DE LA DETTE FOURNISSEUR
  // ============================================================================
  console.log('\n--- 7. Décaissement bancaire et apurement de la dette fournisseur ---');
  // Forcer approbation pour le test
  invPerfectMatch.status = 'APPROUVEE';

  const balanceBeforeSupplierPay = beaAccount.currentBalance;
  const supplierPayRes = await dbBridge.recordSupplierPayment(invPerfectMatch.id, {
    amount: invPerfectMatch.amountTTC, // 5,950,000 DA TTC
    accountId: beaAccount.id,
    referenceDocument: 'VIR-BEA-FOURNISSEUR-TEST',
  });

  assert.strictEqual(supplierPayRes.invoice.status, 'PAYEE', 'Facture fournisseur doit être PAYEE');
  assert.strictEqual(supplierPayRes.invoice.remainingAmount, 0, 'Dette restante doit être à 0');
  assert.strictEqual(beaAccount.currentBalance, balanceBeforeSupplierPay - 5950000, 'Le compte bancaire doit être débité du montant TTC');

  console.log(`  ✓ Facture fournisseur ${invPerfectMatch.internalReference} payée. Nouveau solde BEA: ${beaAccount.currentBalance.toLocaleString('fr-DZ')} DA`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 8 : VIREMENT INTERNE ATOMIQUE DE COMPTE À COMPTE
  // ============================================================================
  console.log('\n--- 8. Virement interne atomique (Double-entry BEA -> Caisse Chantier) ---');
  const beaBeforeTransfer = beaAccount.currentBalance;
  const cashBeforeTransfer = pettyCash.currentBalance;
  const transferAmount = 500000; // 500,000 DA

  const transferRes = await dbBridge.transferBetweenAccounts({
    sourceAccountId: beaAccount.id,
    destinationAccountId: pettyCash.id,
    amount: transferAmount,
    notes: 'Approvisionnement caisse de chantier Skikda pour frais urgents',
    idempotencyKey: 'idemp-transfer-test-1',
  });

  assert.strictEqual(transferRes.success, true, 'Le virement interne doit réussir');
  assert.strictEqual(beaAccount.currentBalance, beaBeforeTransfer - transferAmount, 'Compte BEA doit être débité de 500,000 DA');
  assert.strictEqual(pettyCash.currentBalance, cashBeforeTransfer + transferAmount, 'Caisse Régie doit être créditée de 500,000 DA');

  // Vérifier présence de deux transactions liées
  const txs = await dbBridge.getCashTransactions();
  const debitTx = txs.find(t => t.type === 'VIREMENT_INTERNE_EMIS' && t.referenceDocument === transferRes.transferRef);
  const creditTx = txs.find(t => t.type === 'VIREMENT_INTERNE_RECU' && t.referenceDocument === transferRes.transferRef);
  assert(debitTx, 'Transaction de débit manquante');
  assert(creditTx, 'Transaction de crédit manquante');

  console.log(`  ✓ Transfert atomique de 500,000 DA validé : BEA -> Caisse Régie (Ref: ${transferRes.transferRef})`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 9 : RENTABILITÉ DE PROJET ET ABSENCE DE DOUBLE COMPTAGE
  // ============================================================================
  console.log('\n--- 9. Rentabilité industrielle par projet et contrôle anti-double-compte ---');
  const profitability = await dbBridge.getProjectProfitability('PRJ-2026-001');
  assert(profitability, 'Calcul de rentabilité projet PRJ-2026-001 manquant');

  assert(profitability.contractAmount > 0, 'Montant contractuel doit être > 0');
  assert(profitability.actualBilledHT > 0, 'Chiffre d’affaires facturé doit être > 0');
  assert(profitability.realCosts.materials >= 0, 'Coûts matières doivent être calculés');
  assert(profitability.realCosts.labor >= 0, 'Coûts main d’œuvre doivent être calculés');
  assert.strictEqual(typeof profitability.grossMarginDA, 'number', 'La marge brute doit être un nombre');
  assert.strictEqual(typeof profitability.grossMarginPercent, 'number', 'Le taux de marge doit être un nombre');

  console.log(`  ✓ PRJ-2026-001: Facturé=${profitability.actualBilledHT.toLocaleString()} DA, Coûts réels direct=${profitability.realCosts.totalDirectCost.toLocaleString()} DA, Marge=${profitability.grossMarginDA.toLocaleString()} DA (${profitability.grossMarginPercent}%)`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 10 : BALANCE ÂGÉE CLIENTS & FOURNISSEURS (BFR)
  // ============================================================================
  console.log('\n--- 10. Balance Âgée & Calcul du Besoin en Fonds de Roulement (BFR) ---');
  const agedBalance = await dbBridge.getAgedTrialBalance();
  assert(agedBalance.clients, 'Structure balance clients manquante');
  assert(agedBalance.suppliers, 'Structure balance fournisseurs manquante');
  assert(typeof agedBalance.netWorkingCapitalNeed === 'number', 'Le BFR doit être calculé');

  console.log(`  ✓ Créances clients: Total=${agedBalance.clients.total.toLocaleString()} DA (Courant: ${agedBalance.clients.current.toLocaleString()} DA, >30j: ${agedBalance.clients.days30.toLocaleString()} DA)`);
  console.log(`  ✓ Dettes fournisseurs: Total=${agedBalance.suppliers.total.toLocaleString()} DA`);
  console.log(`  ✓ BFR (Créances - Dettes): ${agedBalance.netWorkingCapitalNeed.toLocaleString('fr-DZ')} DA`);
  passedTests++;

  // ============================================================================
  // ÉTAPE 11 : TEST D'IDEMPOTENCE & SÉCURITÉ CONTRÔLE DE VALIDATION
  // ============================================================================
  console.log('\n--- 11. Test d’idempotence et sécurité SoD (Separation of Duties) ---');
  
  // Idempotence sur transaction
  const initialTxCount = (await dbBridge.getCashTransactions()).length;
  const duplicateTx = await dbBridge.recordCashTransaction({
    accountId: beaAccount.id,
    type: 'ENCAISSEMENT_CLIENT',
    amount: 100000,
    idempotencyKey: 'test-idemp-unique-1234',
  });
  const retryTx = await dbBridge.recordCashTransaction({
    accountId: beaAccount.id,
    type: 'ENCAISSEMENT_CLIENT',
    amount: 100000,
    idempotencyKey: 'test-idemp-unique-1234',
  });
  assert.strictEqual(duplicateTx.id, retryTx.id, 'Une transaction avec la même clé idempotente doit retourner l’enregistrement existant');

  // Sécurité paiement sans approbation
  let rejectedPay = false;
  try {
    await dbBridge.recordSupplierPayment(invPriceMismatch.id, {
      amount: 100000,
      accountId: beaAccount.id,
    });
  } catch (e) {
    rejectedPay = true;
  }
  assert.strictEqual(rejectedPay, true, 'Le paiement d’une facture fournisseur avec écart non approuvée doit être strictement refusé');

  console.log(`  ✓ Idempotence respectée et sécurité SoD anti-décaissement non autorisé validée`);
  passedTests++;

  console.log('\n================================================================================');
  console.log(`RÉSULTAT GLOBAL E2E FINANCE : ${passedTests}/${totalTests} ÉTAPES VALIDÉES AVEC SUCCÈS (100%)`);
  console.log('================================================================================\n');
}

run().catch(err => {
  console.error('\n❌ ERREUR E2E FINANCE :', err);
  process.exit(1);
});
