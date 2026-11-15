/**
 * TEST E2E PHASE E : ACHATS, APPROVISIONNEMENTS, GESTION DES STOCKS & TRAÇABILITÉ DES ACIERS
 * Conforme aux exigences de la PARTIE 6 de l'audit fonctionnel SILEX SERVICES ERP
 */

const assert = require('assert');
const { serverStore } = require('../apps/web/src/lib/server-store');

async function run() {
  console.log('=== TEST E2E PHASE E : ACHATS, APPROVISIONNEMENTS & TRAÇABILITÉ DES ACIERS ===\n');

  // =========================================================================
  // 1. DEMANDES D'ACHAT (DA) & RÈGLES DE CONTRÔLE SOD (Section 6.1)
  // =========================================================================
  console.log('--- 1. Contrôle & Validation des Demandes d\'Achat (Section 6.1) ---');

  // 1.1 Rejet si quantité <= 0
  console.log('  * Test de rejet : Quantité nulle ou négative...');
  let errQuantite = false;
  try {
    serverStore.createPurchaseRequest({
      projectId: 'prj-2026-001',
      items: [{ description: 'Boulons HM20', quantity: 0, estimatedUnitPrice: 500 }],
    });
  } catch (err) {
    errQuantite = true;
    console.log(`    -> Rejet confirmé : "${err.message}"`);
  }
  assert.strictEqual(errQuantite, true, 'Une quantité <= 0 doit être rejetée');

  // 1.2 Rejet si non rattachée à un projet ni compte de frais généraux
  console.log('  * Test de rejet : Demande d\'achat orpheline sans projet ni imputation...');
  let errOrphelin = false;
  try {
    serverStore.createPurchaseRequest({
      items: [{ description: 'EPI Masques FFP3', quantity: 10, estimatedUnitPrice: 1200 }],
    });
  } catch (err) {
    errOrphelin = true;
    console.log(`    -> Rejet confirmé : "${err.message}"`);
  }
  assert.strictEqual(errOrphelin, true, 'Une DA sans projet ou compte de frais doit être rejetée');

  // 1.3 Matrice SoD à 3 seuils d'approbation
  console.log('\n  * Test Seuil 1 SoD : DA <= 100 000 DA (Visa RESPONSABLE_ACHATS)');
  const daTier1 = serverStore.createPurchaseRequest({
    projectId: 'prj-2026-001',
    items: [{ description: 'Joints plats klingerite DN150', quantity: 10, estimatedUnitPrice: 4500 }],
    totalHT: 45000,
  });
  assert.strictEqual(daTier1.requiredApprovalLevel, 'RESPONSABLE_ACHATS');
  console.log(`    -> DA ${daTier1.code} : Montant ${daTier1.amountHT} DA -> Niveau requis : ${daTier1.requiredApprovalLevel}`);

  console.log('  * Test Seuil 2 SoD : DA 100 000 DA à 500 000 DA (Double Visa PROJET & ACHATS)');
  const daTier2 = serverStore.createPurchaseRequest({
    projectId: 'prj-2026-001',
    items: [{ description: 'Électrodes basiques E7018 3.2mm', quantity: 30, estimatedUnitPrice: 5000 }],
    totalHT: 150000,
  });
  assert.strictEqual(daTier2.requiredApprovalLevel, 'RESPONSABLE_PROJET_ET_ACHATS');
  console.log(`    -> DA ${daTier2.code} : Montant ${daTier2.amountHT} DA -> Niveau requis : ${daTier2.requiredApprovalLevel}`);

  console.log('  * Test Seuil 3 SoD : DA > 500 000 DA (Arbitrage DIRECTEUR_GENERAL)');
  const daTier3 = serverStore.createPurchaseRequest({
    projectId: 'prj-2026-001',
    items: [{ description: 'Vannes à opercule Class 300 DN150', quantity: 4, estimatedUnitPrice: 320000 }],
    totalHT: 1280000,
  });
  assert.strictEqual(daTier3.requiredApprovalLevel, 'DIRECTEUR_GENERAL');
  console.log(`    -> DA ${daTier3.code} : Montant ${daTier3.amountHT} DA -> Niveau requis : ${daTier3.requiredApprovalLevel}`);

  // 1.4 Détection du dépassement budgétaire & escalade DG
  console.log('\n  * Test de dépassement budgétaire chantier :');
  const projectTest = serverStore.getProject('prj-2026-001');
  const remainingBgt = projectTest.budgetAmount - (projectTest.committedBudget + projectTest.spentBudget);
  console.log(`    Solde budgétaire actuel du projet ${projectTest.code} : ${remainingBgt.toLocaleString()} DA`);

  const daOverBudget = serverStore.createPurchaseRequest({
    projectId: 'prj-2026-001',
    items: [{ description: 'Gros compresseur d\'air mobile', quantity: 1, estimatedUnitPrice: remainingBgt + 500000 }],
    totalHT: remainingBgt + 500000,
  });
  assert.strictEqual(daOverBudget.budgetExceeded, true, 'Le dépassement de budget doit être détecté');
  assert(daOverBudget.budgetExceededAmount > 0, 'Le montant dépassé doit être calculé');
  assert.strictEqual(daOverBudget.requiredApprovalLevel, 'DIRECTEUR_GENERAL', 'Une DA hors budget doit exiger le visa DG');
  console.log(`    ✓ Alerte dépassement confirmée : Dépassement de +${daOverBudget.budgetExceededAmount.toLocaleString()} DA -> Escaladé à la DG`);

  // 1.5 Recherche automatique dans le stock magasin existant
  console.log('\n  * Test de vérification de disponibilité en stock central :');
  const daStockCheck = serverStore.createPurchaseRequest({
    projectId: 'prj-2026-001',
    items: [{
      itemCode: 'ART-TUY-002',
      name: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
      quantity: 5,
      estimatedUnitPrice: 14000,
    }],
    totalHT: 70000,
  });
  assert.strictEqual(daStockCheck.stockAvailableWarning, true, 'Une alerte de stock disponible doit être levée');
  assert(daStockCheck.stockAvailableItems.length > 0, 'Les articles disponibles doivent être listés');
  console.log(`    ✓ Détection de stock disponible : ${daStockCheck.stockAvailableItems[0].availableStock} U en stock pour 5 U demandées`);

  // =========================================================================
  // 2. BONS DE RÉCEPTION (BR) & TRAÇABILITÉ QUALITÉ (Section 6.2)
  // =========================================================================
  console.log('\n--- 2. Bons de Réception (BR) & Contrôle Qualité Réception (Section 6.2) ---');

  // 2.1 Rejet si BL fournisseur manquant
  console.log('  * Test de rejet : Réception sans numéro de BL fournisseur...');
  let errBL = false;
  try {
    serverStore.recordGoodsReceipt({
      purchaseOrderId: 'po-001',
      deliveryNoteNumber: '',
      warehouseId: 'wh-001',
      lines: [{ itemId: 'itm-001', deliveredQuantity: 10, unitPriceHT: 18500 }],
    });
  } catch (err) {
    errBL = true;
    console.log(`    -> Rejet confirmé : "${err.message}"`);
  }
  assert.strictEqual(errBL, true, 'Le numéro de BL fournisseur est obligatoire');

  // 2.2 Rejet si composant acier critique sans numéro de coulée (Heat Number)
  console.log('  * Test de rejet : Acier ASTM A106 sans numéro de coulée...');
  let errCoulee = false;
  try {
    serverStore.recordGoodsReceipt({
      purchaseOrderId: 'po-001',
      deliveryNoteNumber: 'BL-FOU-8899',
      warehouseId: 'wh-001',
      lines: [{
        itemId: 'itm-001',
        description: 'Tube acier carbone sans soudure Sch 40 DN150 (ASTM A106 Gr.B)',
        deliveredQuantity: 10,
        unitPriceHT: 18500,
        // pas de heatNumber ni batchNumber
      }],
      ccpuVerified: true,
    });
  } catch (err) {
    errCoulee = true;
    console.log(`    -> Rejet confirmé : "${err.message}"`);
  }
  assert.strictEqual(errCoulee, true, 'Le numéro de coulée est obligatoire pour les aciers sous pression');

  // 2.3 Rejet si acier sans certificat matière CCPU 3.1
  console.log('  * Test de rejet : Acier critique sans visa CCPU 3.1...');
  let errCcpu = false;
  try {
    serverStore.recordGoodsReceipt({
      purchaseOrderId: 'po-001',
      deliveryNoteNumber: 'BL-FOU-8899',
      warehouseId: 'wh-001',
      lines: [{
        itemId: 'itm-001',
        description: 'Tube acier carbone sans soudure Sch 40 DN150 (ASTM A106 Gr.B)',
        deliveredQuantity: 10,
        unitPriceHT: 18500,
        heatNumber: 'LOT-A106-HEAT-99',
      }],
      ccpuVerified: false,
    });
  } catch (err) {
    errCcpu = true;
    console.log(`    -> Rejet confirmé : "${err.message}"`);
  }
  assert.strictEqual(errCcpu, true, 'Le certificat CCPU 3.1 est obligatoire pour les tuyauteries ASTM');

  // 2.4 Réception conforme avec CCPU 3.1 & incrément de stock
  console.log('\n  * Test de réception conforme avec traçabilité complète CCPU 3.1 :');
  const stockInitial = serverStore.getInventoryItems().find(i => i.id === 'itm-002')?.currentStock || 0;

  const validBr = serverStore.recordGoodsReceipt({
    purchaseOrderId: 'po-001',
    deliveryNoteNumber: 'BL-BATIMETAL-9921',
    receiptDate: '2026-11-05',
    warehouseId: 'wh-001',
    ccpuVerified: true,
    qualityObservations: 'Contrôle dimensionnel conforme. Certificat CCPU 3.1 visé conforme.',
    lines: [{
      itemId: 'itm-002',
      itemCode: 'ART-TUY-002',
      description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
      orderedQuantity: 20,
      deliveredQuantity: 2,
      acceptedQuantity: 2,
      rejectedQuantity: 0,
      heatNumber: 'HEAT-A234-2026-991',
      ccpuCertificateRef: 'CCPU-A234-EN10204-991',
      unitPriceHT: 14000,
    }],
  }, { name: 'Mourad Zitouni', role: 'MAGASINIER' });

  assert.strictEqual(validBr.status, 'PARTIEL');
  assert.strictEqual(validBr.qualityInspection.overallStatus, 'CONFORME');
  assert.strictEqual(validBr.qualityInspection.ccpuVerified, true);

  const stockApres = serverStore.getInventoryItems().find(i => i.id === 'itm-002')?.currentStock || 0;
  assert.strictEqual(stockApres, stockInitial + 2, 'Le stock physique doit être incrémenté de la quantité acceptée');
  console.log(`    ✓ Réception ${validBr.receiptNumber} validée (Stock itm-002: ${stockInitial} -> ${stockApres} U, Statut: ${validBr.status})`);

  // 2.5 Réception avec Rejet & Quarantaine Magasin
  console.log('\n  * Test de réception avec Rejet & Quarantaine Magasin :');
  const stockItm1BeforeRejet = serverStore.getInventoryItems().find(i => i.id === 'itm-001')?.currentStock || 0;

  const brRejet = serverStore.recordGoodsReceipt({
    purchaseOrderId: 'po-001',
    deliveryNoteNumber: 'BL-LITIGE-404',
    receiptDate: '2026-11-06',
    warehouseId: 'wh-001',
    conformityStatus: 'REJETE',
    rejectionReason: 'Ovalisation hors tolérances ASTM et absence de chanfrein conforme',
    lines: [{
      itemId: 'itm-001',
      itemCode: 'ART-TUY-001',
      description: 'Tube acier carbone non conforme',
      orderedQuantity: 10,
      deliveredQuantity: 5,
      rejectedQuantity: 5,
      rejectionReason: 'Ovalisation hors tolérance',
      unitPriceHT: 18500,
    }],
  }, { name: 'Nadia Chaib', role: 'RESPONSABLE_QHSE' });

  assert.strictEqual(brRejet.status, 'REJETE');
  assert.strictEqual(brRejet.isQuarantined, true, 'Les pièces rejetées doivent être en quarantaine');
  assert(brRejet.quarantineWarehouseLocation.includes('Quarantaine'), 'L\'emplacement doit mentionner la zone quarantaine');

  const stockApresRejet = serverStore.getInventoryItems().find(i => i.id === 'itm-001')?.currentStock || 0;
  assert.strictEqual(stockApresRejet, stockItm1BeforeRejet, 'Le stock disponible ne doit PAS inclure les pièces rejetées');
  console.log(`    ✓ Rejet ${brRejet.receiptNumber} confiné en "${brRejet.quarantineWarehouseLocation}" (Stock disponible inchangé: ${stockApresRejet})`);

  // =========================================================================
  // 3. BONS DE SORTIE MAGASIN (BSM) & IMPUTATION ANALYTIQUE (Section 6.3)
  // =========================================================================
  console.log('\n--- 3. Bons de Sortie Magasin (BSM) & Imputation Analytique Chantier (Section 6.3) ---');

  // 3.1 Rejet si stock insuffisant
  console.log('  * Test de rejet : Quantité demandée supérieure au stock physique disponible...');
  let errStockInsuffisant = false;
  try {
    serverStore.createBonDeSortie({
      projectId: 'prj-2026-001',
      wbsCategory: 'TUYAUTERIE',
      recipientName: 'Tahar Benaissa',
      items: [{
        itemId: 'itm-001',
        quantity: 99999, // Impossible
      }],
    });
  } catch (err) {
    errStockInsuffisant = true;
    console.log(`    -> Rejet bloquant confirmé : "${err.message}"`);
  }
  assert.strictEqual(errStockInsuffisant, true, 'Le déstockage au-delà du stock réel doit être bloqué');

  // 3.2 Émission d'un Bon de Sortie régulier au PUMP avec imputation directe
  console.log('\n  * Test d\'émission d\'un BSM conforme au coût moyen unitaire pondéré (PUMP) :');
  const prjBefore = serverStore.getProject('prj-2026-001');
  const spentBefore = prjBefore.spentBudget;
  const costEntriesCountBefore = prjBefore.costEntries?.length || 0;
  const stockItm2Before = serverStore.getInventoryItems().find(i => i.id === 'itm-002')?.currentStock || 0;

  const bsm = serverStore.createBonDeSortie({
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    wbsCategory: 'TUYAUTERIE_HAUTE_PRESSION',
    recipientName: 'Tahar Benaissa (Chef d\'équipe Tuyauterie)',
    driverName: 'Mustapha Allouche',
    vehicleMatricule: '08944-126-16',
    items: [{
      itemId: 'itm-002',
      quantity: 5,
      heatNumber: 'LOT-A234-WPB-44',
    }],
  }, { name: 'Mourad Zitouni', role: 'MAGASINIER' });

  assert(bsm.bonNumber.startsWith('BSM-2026-'), 'Le numéro de BSM doit respecter le format normé');
  assert.strictEqual(bsm.items[0].quantity, 5);
  assert.strictEqual(bsm.items[0].unitCost, 14000);
  assert.strictEqual(bsm.totalAmountDA, 70000);

  // Vérification de la décrémentation du stock
  const stockItm2After = serverStore.getInventoryItems().find(i => i.id === 'itm-002')?.currentStock || 0;
  assert.strictEqual(stockItm2After, stockItm2Before - 5, 'Le stock physique doit être décrémenté de 5');

  // Vérification de l'imputation analytique au chantier
  const prjAfter = serverStore.getProject('prj-2026-001');
  assert.strictEqual(prjAfter.spentBudget, spentBefore + 70000, 'Le coût dépensé du chantier doit être incrémenté de +70 000 DA');
  assert.strictEqual(prjAfter.costEntries?.length, costEntriesCountBefore + 1, 'Une écriture analytique de coût doit être ajoutée au projet');

  const latestCost = prjAfter.costEntries[prjAfter.costEntries.length - 1];
  assert.strictEqual(latestCost.reference, bsm.bonNumber);
  assert.strictEqual(latestCost.amount, 70000);
  assert.strictEqual(latestCost.category, 'FOURNITURES');
  console.log(`    ✓ BSM ${bsm.bonNumber} émis avec succès (Total: ${bsm.totalAmountDA.toLocaleString()} DA PUMP)`);
  console.log(`    ✓ Stock itm-002 décrémenté : ${stockItm2Before} -> ${stockItm2After} U`);
  console.log(`    ✓ Imputation analytique chantier PRJ-2026-001 confirmée : ${spentBefore.toLocaleString()} -> ${prjAfter.spentBudget.toLocaleString()} DA (+${latestCost.amount} DA)`);

  // =========================================================================
  // 4. TRAÇABILITÉ DES ACIERS CRITIQUES (Section 6.4)
  // =========================================================================
  console.log('\n--- 4. Traçabilité des Aciers & Cycle de Vie Industriel (Section 6.4) ---');

  console.log('  * Test de traçabilité par Numéro de Coulée (Heat Number: LOT-A234-WPB-44) :');
  const trace = serverStore.getMaterialTraceability('LOT-A234-WPB-44');
  assert.strictEqual(trace.found, true, 'Le numéro de coulée doit être retrouvé');
  assert(trace.receipts.length > 0, 'Au moins un bon de réception doit correspondre à la coulée');
  assert(trace.issues.length > 0, 'Au moins un bon de sortie doit correspondre à la coulée');
  assert(trace.timeline.length >= 2, 'La chronologie industrielle doit contenir au moins 2 jalons');

  console.log(`    ✓ Réceptions rattachées : ${trace.receipts.map(r => r.receiptNumber).join(', ')}`);
  console.log(`    ✓ Bons de sortie magasin : ${trace.issues.map(i => i.bonNumber).join(', ')}`);
  console.log(`    ✓ Jalons de cycle de vie tracés :`);
  trace.timeline.forEach((step, idx) => {
    console.log(`      ${idx + 1}. [${step.step}] ${step.title} (${step.reference}) — ${step.actor}`);
  });

  console.log('\n=== TOUS LES CONTRÔLES ET TESTS E2E DE LA PHASE E ONT RÉUSSI À 100% ===');
}

run().catch(err => {
  console.error('\n❌ ÉCHEC DU TEST E2E PHASE E :', err);
  process.exit(1);
});
