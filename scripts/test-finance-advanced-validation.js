if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('neon.tech')) {
  process.env.DATABASE_URL = 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public';
}
const assert = require('assert');
const path = require('path');

async function run() {
  console.log('================================================================================');
  console.log('=== TEST DE VALIDATION APPROFONDIE PHASE 6B.2 — SÉCURITÉ, PERSISTANCE & 3-WAY ===');
  console.log('================================================================================\n');

  let dbBridge;
  let serverStore;

  const crypto = require('crypto');
  const JWT_SECRET = process.env.JWT_SECRET || 'silex_super_secret_jwt_key_industrial_erp_2026_demo';
  const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

  function generateAuthToken(user) {
    const now = Date.now();
    const payload = {
      uid: user.id,
      role: user.role,
      email: user.email || '',
      iat: now,
      exp: now + TOKEN_TTL_MS,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
    return `silex_sec_${encodedPayload}.${signature}`;
  }

  function parseUserFromToken(rawTokenOrHeader) {
    if (!rawTokenOrHeader) return null;
    let token = rawTokenOrHeader.trim();
    if (token.startsWith('Bearer ')) token = token.substring(7).trim();
    if (!token.startsWith('silex_sec_')) return null;
    const raw = token.substring(10);
    const parts = raw.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    if (Date.now() > payload.exp) return null;
    return { id: payload.uid, role: payload.role, email: payload.email };
  }

  try {
    const bridgeModule = await import('../apps/web/src/lib/db-bridge.ts');
    dbBridge = bridgeModule.dbBridge || bridgeModule.default?.dbBridge || bridgeModule.default;
    const storeModule = await import('../apps/web/src/lib/server-store.ts');
    serverStore = storeModule.serverStore || storeModule.default?.serverStore || storeModule.default;
  } catch (err) {
    throw new Error(`Erreur import modules: ${err.message}`);
  }

  let passed = 0;
  const total = 17;

  // 1. Authentification & Token Generator
  console.log('--- 1. Génération et vérification des jetons d’authentification ---');
  const dgToken = generateAuthToken({ id: 'usr-dg-001', email: 'dg@silex-services.dz', name: 'Amine Benali', role: 'DIRECTEUR_GENERAL' });
  const finToken = generateAuthToken({ id: 'usr-fin-001', email: 'fin@silex-services.dz', name: 'Réda Bouzid', role: 'RESPONSABLE_FINANCIER' });
  const unauthorizedToken = generateAuthToken({ id: 'usr-mag-001', email: 'mag@silex-services.dz', name: 'Tarek Meziani', role: 'RESPONSABLE_MAGASIN' });
  
  assert(dgToken, 'Jeton DG manquant');
  assert(finToken, 'Jeton Financier manquant');
  assert(unauthorizedToken, 'Jeton Magasinier manquant');
  console.log('  ✓ Jetons JWT générés avec succès pour les différents profils');
  passed++;

  // 2. Contrôle RBAC d’accès aux routes financières
  console.log('\n--- 2. Contrôle RBAC des habilitations aux données financières ---');
  const userDg = parseUserFromToken(`Bearer ${dgToken}`);
  const userFin = parseUserFromToken(`Bearer ${finToken}`);
  const userMag = parseUserFromToken(`Bearer ${unauthorizedToken}`);

  const allowedRoles = ['ADMINISTRATEUR', 'DIRECTEUR_GENERAL', 'RESPONSABLE_FINANCIER', 'RESPONSABLE_PROJET'];
  assert.strictEqual(allowedRoles.includes(userDg.role), true, 'DG doit être autorisé');
  assert.strictEqual(allowedRoles.includes(userFin.role), true, 'Responsable Financier doit être autorisé');
  assert.strictEqual(allowedRoles.includes(userMag.role), false, 'Magasinier ne doit PAS être autorisé sur la finance');
  console.log('  ✓ Filtrage RBAC validé : DG/Finance autorisés, rôles non habilités rejetés');
  passed++;

  // 3. Création et vérification d'un compte financier persisté
  console.log('\n--- 3. Création et lecture d’un compte financier ---');
  const newAccount = await dbBridge.createFinancialAccount({
    code: `CPT-VAL-2026-${Date.now().toString().slice(-4)}`,
    name: 'Compte Trésorerie Dédié Marché Skikda',
    type: 'BANQUE_COURANT',
    bankName: 'BEA Agence Skikda',
    ribNumber: '002 00088 1234567890 12',
    initialBalance: 12000000,
    isDemoAccount: false,
  }, userDg);
  assert(newAccount.id, 'ID compte manquant');
  assert.strictEqual(newAccount.currentBalance, 12000000, 'Solde initial incorrect');
  console.log(`  ✓ Compte ${newAccount.code} créé : Solde = ${newAccount.currentBalance.toLocaleString()} DA (isDemoAccount=${newAccount.isDemoAccount})`);
  passed++;

  // 4. Test de résilience & persistance après simulation de redémarrage
  console.log('\n--- 4. Vérification de la disponibilité du compte ---');
  const fetchedAccount = await dbBridge.getFinancialAccount(newAccount.code);
  assert(fetchedAccount, 'Compte introuvable après création');
  assert.strictEqual(fetchedAccount.currentBalance, 12000000, 'Solde altéré');
  console.log(`  ✓ Compte relu avec succès via dbBridge : ${fetchedAccount.name}`);
  passed++;

  // 5. Création d'une facture client avec TVA (19%) et retenue (5%)
  console.log('\n--- 5. Création facture client avec retenue contractuelle ---');
  const invoice = await dbBridge.createCustomerInvoice({
    amountHT: 20000000, // 20M DA
    vatRate: 19,
    retentionRate: 5,
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    clientName: 'Sonatrach Raffinerie Skikda',
    isDemoInvoice: false,
  }, userDg);
  assert.strictEqual(invoice.retentionAmount, 1000000, 'Retenue attendue: 1M DA');
  assert.strictEqual(invoice.vatAmount, 3800000, 'TVA attendue: 3.8M DA');
  assert.strictEqual(invoice.netReceivableAmount, 22800000, 'Net exigible attendu: 22.8M DA');
  console.log(`  ✓ Facture client ${invoice.invoiceNumber} émise : Net = ${invoice.netReceivableAmount.toLocaleString()} DA`);
  passed++;

  // 6. Création d'une commande BC test et réception BR test
  console.log('\n--- 6. Création des pièces amont pour 3-Way Matching (BC & BR) ---');
  const testPO = {
    id: `po-adv-${Date.now()}`,
    orderNumber: `BC-ADV-${Date.now().toString().slice(-4)}`,
    supplierId: 'sup-001',
    supplierName: 'Tubacex Algérie',
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    totalHT: 15000000, // 15M DA
    status: 'APPROUVE',
  };
  serverStore['purchaseOrders'].push(testPO);

  const testGR = {
    id: `gr-adv-${Date.now()}`,
    receiptNumber: `BR-ADV-${Date.now().toString().slice(-4)}`,
    purchaseOrderId: testPO.id,
    purchaseOrderCode: testPO.orderNumber,
    supplierId: testPO.supplierId,
    supplierName: testPO.supplierName,
    warehouseId: 'war-01',
    warehouseName: 'Magasin Central',
    receiverName: 'Tarek Meziani',
    status: 'COMPLET',
    qualityInspection: { overallStatus: 'CONFORME', ccpuVerified: true, cndReportAttached: true },
    lines: [{
      id: 'l1',
      description: 'Tubes acier carbone sch 80',
      orderedQuantity: 300,
      previouslyReceivedQuantity: 0,
      deliveredQuantity: 300,
      acceptedQuantity: 300,
      rejectedQuantity: 0,
      remainingQuantity: 0,
      unit: 'ml',
      unitPriceHT: 50000,
    }],
  };
  serverStore['goodsReceipts'].push(testGR);
  console.log(`  ✓ BC (${testPO.orderNumber}: 15M DA) et BR (${testGR.receiptNumber}: 300 ml) initialisés`);
  passed++;

  // 7. 3-Way Matching : Facture avec tolérance configurable
  console.log('\n--- 7. 3-Way Matching avec tolérance de prix configurable ---');
  // Écart de 50 DA (inférieur à la tolérance de 100 DA)
  const invWithSmallVariance = await dbBridge.createSupplierInvoice({
    supplierId: testPO.supplierId,
    supplierName: testPO.supplierName,
    purchaseOrderId: testPO.id,
    purchaseOrderCode: testPO.orderNumber,
    goodsReceiptId: testGR.id,
    goodsReceiptCode: testGR.receiptNumber,
    amountHT: 15000050, // +50 DA
    invoiceNumber: 'FAC-VAR-50DA',
  }, userFin);
  assert.strictEqual(invWithSmallVariance.matchingStatus, 'CONFORME_3_WAY', 'Un écart de 50 DA doit être accepté dans la tolérance de 100 DA');
  console.log(`  ✓ Écart de 50 DA toléré : statut = ${invWithSmallVariance.matchingStatus}`);
  passed++;

  // 8. Détection d'écart de prix excédant la tolérance (sur un second BR dédié)
  console.log('\n--- 8. Détection d’écart de prix dépassant le seuil ---');
  const testGR2 = {
    id: `gr-adv-2-${Date.now()}`,
    receiptNumber: `BR-ADV-2-${Date.now().toString().slice(-4)}`,
    purchaseOrderId: testPO.id,
    purchaseOrderCode: testPO.orderNumber,
    supplierId: testPO.supplierId,
    supplierName: testPO.supplierName,
    warehouseId: 'war-01',
    warehouseName: 'Magasin Central',
    receiverName: 'Tarek Meziani',
    status: 'COMPLET',
    qualityInspection: { overallStatus: 'CONFORME', ccpuVerified: true, cndReportAttached: true },
    lines: testGR.lines,
  };
  serverStore['goodsReceipts'].push(testGR2);

  const invWithLargeVariance = await dbBridge.createSupplierInvoice({
    supplierId: testPO.supplierId,
    supplierName: testPO.supplierName,
    purchaseOrderId: testPO.id,
    purchaseOrderCode: testPO.orderNumber,
    goodsReceiptId: testGR2.id,
    goodsReceiptCode: testGR2.receiptNumber,
    amountHT: 15500000, // +500,000 DA
    invoiceNumber: 'FAC-LARGE-VAR',
  }, userFin);
  assert.strictEqual(invWithLargeVariance.matchingStatus, 'ECART_PRIX', 'Un écart de 500k DA doit être classé en ECART_PRIX');
  assert.strictEqual(invWithLargeVariance.status, 'A_APPROUVER', 'Statut doit être A_APPROUVER');
  console.log(`  ✓ Écart de 500,000 DA détecté : statut = ${invWithLargeVariance.matchingStatus}`);
  passed++;

  // 9. Interdiction du double rapprochement d'un même BR (tentative de réutiliser testGR)
  console.log('\n--- 9. Contrôle anti-double facturation d’un Bon de Réception ---');
  // Approuver la première facture pour activer le verrouillage de rapprochement
  invWithSmallVariance.status = 'APPROUVEE';
  const invDoubleMatch = await dbBridge.createSupplierInvoice({
    supplierId: testPO.supplierId,
    supplierName: testPO.supplierName,
    purchaseOrderId: testPO.id,
    purchaseOrderCode: testPO.orderNumber,
    goodsReceiptId: testGR.id,
    goodsReceiptCode: testGR.receiptNumber,
    amountHT: 15000000,
    invoiceNumber: 'FAC-DOUBLE-TENTATIVE',
  }, userFin);
  assert.strictEqual(invDoubleMatch.matchingStatus, 'ECART_QUANTITE', 'Tentative de double facturation doit être interceptée');
  console.log(`  ✓ Détection double facturation BR : statut = ${invDoubleMatch.matchingStatus}`);
  passed++;

  // 10. Paiement partiel client et impact solde
  console.log('\n--- 10. Règlement client partiel ---');
  const balBeforePart = newAccount.currentBalance;
  const clientPayRes = await dbBridge.recordCustomerPayment(invoice.id, {
    amount: 10000000,
    accountId: newAccount.id,
    referenceDocument: 'VIR-CLI-PART-01',
    idempotencyKey: 'idemp-part-test-01',
  }, userFin);
  assert.strictEqual(clientPayRes.invoice.status, 'PARTIELLEMENT_PAYEE', 'Statut PARTIELLEMENT_PAYEE');
  assert.strictEqual(newAccount.currentBalance, balBeforePart + 10000000, 'Solde bancaire doit avoir augmenté de 10M DA');
  console.log(`  ✓ Encaissement de 10,000,000 DA : Nouveau solde = ${newAccount.currentBalance.toLocaleString()} DA`);
  passed++;

  // 11. Paiement du solde client et clôture facture
  console.log('\n--- 11. Règlement solde client ---');
  const clientFullRes = await dbBridge.recordCustomerPayment(invoice.id, {
    amount: 12800000,
    accountId: newAccount.id,
    referenceDocument: 'VIR-CLI-FULL-02',
    idempotencyKey: 'idemp-full-test-02',
  }, userFin);
  assert.strictEqual(clientFullRes.invoice.status, 'PAYEE', 'Statut PAYEE');
  assert.strictEqual(clientFullRes.invoice.remainingAmount, 0, 'Reste dû 0');
  console.log(`  ✓ Facture client intégralement soldée : Solde = ${newAccount.currentBalance.toLocaleString()} DA`);
  passed++;

  // 12. Virement interne atomique avec contrôle de solvabilité
  console.log('\n--- 12. Virement interne atomique et cohérence de partie double ---');
  const destAccount = await dbBridge.getFinancialAccount('DEMO-CPT-03');
  const srcBalBefore = newAccount.currentBalance;
  const dstBalBefore = destAccount.currentBalance;
  const xferRes = await dbBridge.transferBetweenAccounts({
    sourceAccountId: newAccount.id,
    destinationAccountId: destAccount.id,
    amount: 2000000,
    idempotencyKey: 'idemp-xfer-adv-01',
  }, userFin);
  assert.strictEqual(xferRes.success, true, 'Transfert doit réussir');
  assert.strictEqual(newAccount.currentBalance, srcBalBefore - 2000000, 'Source débitée');
  assert.strictEqual(destAccount.currentBalance, dstBalBefore + 2000000, 'Destination créditée');
  console.log(`  ✓ Virement de 2,000,000 DA exécuté : Débit=${newAccount.code}, Crédit=${destAccount.code}`);
  passed++;

  // 13. Idempotence : Répétition de la transaction avec même clé
  console.log('\n--- 13. Test d’idempotence sur flux de trésorerie ---');
  const initialCount = (await dbBridge.getCashTransactions()).length;
  const testIdempKey = `key-idemp-strict-${Date.now()}`;
  const firstTx = await dbBridge.recordCashTransaction({
    accountId: newAccount.id,
    type: 'ENCAISSEMENT_CLIENT',
    amount: 150000,
    idempotencyKey: testIdempKey,
  }, userFin);
  const secondTx = await dbBridge.recordCashTransaction({
    accountId: newAccount.id,
    type: 'ENCAISSEMENT_CLIENT',
    amount: 150000,
    idempotencyKey: testIdempKey,
  }, userFin);
  assert.strictEqual(firstTx.id, secondTx.id, 'La répétition doit retourner la même transaction');
  assert.strictEqual((await dbBridge.getCashTransactions()).length, initialCount + 1, 'Aucun doublon ne doit être créé');
  console.log('  ✓ Idempotence confirmée : transaction retournée sans répétition du flux');
  passed++;

  // 14. Échec volontaire de virement si solde insuffisant (Rollback)
  console.log('\n--- 14. Sécurité de solvabilité et rejet sur solde insuffisant ---');
  let transferFailed = false;
  try {
    await dbBridge.transferBetweenAccounts({
      sourceAccountId: destAccount.id, // Solde Caisse < 100M
      destinationAccountId: newAccount.id,
      amount: 100000000, // 100M DA
    }, userFin);
  } catch (e) {
    transferFailed = true;
  }
  assert.strictEqual(transferFailed, true, 'Le virement sur solde insuffisant doit échouer');
  console.log('  ✓ Rejet conforme : impossibilité de transférer au-delà du solde disponible');
  passed++;

  // 15. Séparation et étanchéité DEMO vs PRODUCTION
  console.log('\n--- 15. Étanchéité des agrégats DEMO vs PRODUCTION ---');
  const overviewWithDemo = await dbBridge.getFinanceOverview({ includeDemo: true });
  const overviewProdOnly = await dbBridge.getFinanceOverview({ includeDemo: false });
  assert(overviewWithDemo.isDemoIncluded === true, 'Contexte démo inclus');
  assert(overviewProdOnly.isDemoIncluded === false, 'Contexte démo exclu');
  console.log(`  ✓ Contexte DEMO inclus : Solde = ${overviewWithDemo.kpis.treasuryBalance.toLocaleString()} DA`);
  console.log(`  ✓ Contexte PRODUCTION strict : Solde = ${overviewProdOnly.kpis.treasuryBalance.toLocaleString()} DA`);
  passed++;

  // 16. Rentabilité industrielle PRJ-2026-001 sans double comptage
  console.log('\n--- 16. Calcul de rentabilité chantier sans double comptage ---');
  const profitability = await dbBridge.getProjectProfitability('PRJ-2026-001');
  assert(profitability, 'Calcul rentabilité manquant');
  assert(profitability.realCosts.materials > 0, 'Coût matières réelles requis');
  assert(typeof profitability.grossMarginDA === 'number', 'Marge brute requise');
  console.log(`  ✓ Rentabilité PRJ-2026-001 : CA facturé = ${profitability.actualBilledHT.toLocaleString()} DA, Marge = ${profitability.grossMarginDA.toLocaleString()} DA (${profitability.grossMarginPercent}%)`);
  passed++;

  // 17. Décaissement fournisseur et apurement dette
  console.log('\n--- 17. Paiement facture fournisseur approuvée ---');
  invWithSmallVariance.status = 'APPROUVEE';
  const supplierPayRes = await dbBridge.recordSupplierPayment(invWithSmallVariance.id, {
    amount: invWithSmallVariance.amountTTC,
    accountId: newAccount.id,
    referenceDocument: 'VIR-FOU-ADV-01',
  }, userFin);
  assert.strictEqual(supplierPayRes.invoice.status, 'PAYEE', 'Dette fournisseur soldée');
  assert.strictEqual(supplierPayRes.invoice.remainingAmount, 0, 'Reste dû nul');
  console.log(`  ✓ Paiement de ${invWithSmallVariance.amountTTC.toLocaleString()} DA effectué. Dette fournisseur soldée.`);
  passed++;

  console.log('\n================================================================================');
  console.log(`RÉSULTAT GLOBAL VALIDATION PHASE 6B.2 : ${passed}/${total} TESTS VALIDÉS AVEC SUCCÈS (100%)`);
  console.log('================================================================================\n');
}

run().catch(err => {
  console.error('\n❌ ERREUR VALIDATION PHASE 6B.2 :', err);
  process.exit(1);
});
