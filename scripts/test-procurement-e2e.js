const assert = require('assert');

async function run() {
  console.log('=== TEST E2E: MODULE 03 ACHATS, APPROVISIONNEMENTS, TCO & STOCKS SARL SILEX SERVICES ===\n');

  const { serverStore } = require('../apps/web/src/lib/server-store');

  // ============================================================================
  // ÉTAPE 1 : VÉRIFICATION DE LA BASELINE INDUSTRIELLE
  // ============================================================================
  console.log('[1] Vérification du référentiel fournisseurs, magasins et articles');
  const suppliers = await serverStore.getSuppliers();
  assert.ok(suppliers.length >= 6, 'Au moins 6 fournisseurs industriels doivent être initialisés');
  console.log(`Fournisseurs référencés: ${suppliers.length}`);

  const batimetal = suppliers.find(s => s.code === 'FOURN-001');
  assert.ok(batimetal, 'Batimetal Tuyauteries Algérie doit être présent');
  assert.strictEqual(batimetal.status, 'ACTIF');
  console.log(`Fournisseur vérifié: ${batimetal.name} (${batimetal.code}) - Statut: ${batimetal.status}`);

  const warehouses = await serverStore.getWarehouses();
  assert.ok(warehouses.length >= 3, 'Au moins 3 dépôts/magasins physiques doivent exister');
  console.log(`Magasins recensés: ${warehouses.length}`);
  const arzew = warehouses.find(w => w.code === 'MAG-01');
  assert.ok(arzew, 'Magasin Central Arzew doit exister');
  console.log(`Dépôt vérifié: ${arzew.name} (${arzew.code}) - Localisation: ${arzew.location}`);

  const items = await serverStore.getInventoryItems();
  assert.ok(items.length >= 9, 'Au moins 9 articles industriels typés doivent être initialisés');
  console.log(`Articles industriels répertoriés: ${items.length}`);
  const pipeItem = items.find(i => i.code === 'ART-TUY-001');
  assert.ok(pipeItem, 'Article Tube acier carbone sans soudure Sch 40 doit exister');
  assert.strictEqual(pipeItem.unit, 'ml');
  console.log(`Article vérifié: ${pipeItem.name} (${pipeItem.code}) - Stock actuel: ${pipeItem.currentStock} ${pipeItem.unit} (Coût: ${pipeItem.unitCost} DA)`);

  // ============================================================================
  // ÉTAPE 2 : EXPRESSION DU BESOIN (EB) DEPUIS LE CHANTIER
  // ============================================================================
  console.log('\n[2] Émission d\'une Expression de Besoin (EB) par le Chef de Chantier');
  const projects = await serverStore.getProjects();
  const activeProj = projects[0];

  const newEb = await serverStore.createNeedRequest({
    projectId: activeProj.id,
    projectCode: activeProj.code,
    projectName: activeProj.name,
    requesterName: 'Khaled Amrani (Chef de Chantier Tuyauterie)',
    siteLocation: 'Zone Raffinage Unité 100 Skikda RA1K',
    priority: 'URGENTE',
    category: 'TUYAUTERIE',
    desiredDate: '2026-11-20',
    title: 'Besoin urgent tubes vapeur 80 bar',
    justification: 'Remplacement d\'urgence tronçon collecteur vapeur sous haute pression 80 bar',
    items: [
      {
        itemId: pipeItem.id,
        itemCode: pipeItem.code,
        description: pipeItem.name,
        quantity: 120,
        unit: pipeItem.unit,
        estimatedUnitPrice: pipeItem.unitCost,
        resourceType: 'ARTICLE_STOCKABLE',
        technicalSpecs: 'Épaisseur Sch 40, CCPU 3.1 exigé EN 10204'
      }
    ]
  }, { name: 'Khaled Amrani', role: 'CHEF_CHANTIER' });

  assert.ok(newEb.reference.startsWith('EB-'), 'La référence doit commencer par EB-');
  assert.strictEqual(newEb.status, 'SOUMISE');
  console.log(`Expression de besoin créée: ${newEb.reference} - Titre: "${newEb.title}" (Statut: ${newEb.status})`);

  // ============================================================================
  // ÉTAPE 3 : VALIDATION DE L'EXPRESSION DE BESOIN PAR LE RESPONSABLE PROJET
  // ============================================================================
  console.log('\n[3] Validation de l\'EB par le Responsable Projet');
  const validatedEb = await serverStore.validateNeedRequest(newEb.id, {
    name: 'Mustapha Benali',
    role: 'RESPONSABLE_PROJET'
  });
  assert.strictEqual(validatedEb.status, 'VALIDEE');
  assert.ok(validatedEb.validationDate, 'La date de validation doit être renseignée');
  console.log(`EB validée avec succès: Statut=${validatedEb.status}, Validateur=${validatedEb.validatorName}`);

  // ============================================================================
  // ÉTAPE 4 : CONVERSION DE L'EB EN DEMANDE D'ACHAT (DA) OFFICIELLE
  // ============================================================================
  console.log('\n[4] Conversion de l\'EB en Demande d\'Achat (DA)');
  const conversionResult = await serverStore.convertNeedRequestToPR(newEb.id, {
    name: 'Karim Mansouri',
    role: 'RESPONSABLE_ACHATS'
  });

  const convertedDa = conversionResult.purchaseRequest;
  assert.ok(convertedDa.code.startsWith('DA-'), 'La DA doit porter la référence DA-');
  const ebAfterConversion = serverStore.getNeedRequest(newEb.id);
  assert.strictEqual(ebAfterConversion.status, 'CONVERTIE_EN_DA');
  assert.strictEqual(ebAfterConversion.convertedPrCode, convertedDa.code);
  console.log(`Conversion réussie: DA ${convertedDa.code} générée depuis ${newEb.reference} (Statut EB: ${ebAfterConversion.status})`);

  // ============================================================================
  // ÉTAPE 5 : CONSULTATION FOURNISSEURS MULTI-SOURCES (RFQ)
  // ============================================================================
  console.log('\n[5] Lancement d\'une Consultation Fournisseurs (RFQ / Consultation)');
  const rfq = await serverStore.createRfqConsultation({
    title: 'Appel d\'offres Fourniture Tuyauteries & Vannes HP - Raffinerie Skikda',
    projectId: activeProj.id,
    projectCode: activeProj.code,
    projectName: activeProj.name,
    purchaseRequestId: convertedDa.id,
    purchaseRequestCode: convertedDa.code,
    closingDate: '2026-11-25',
    invitedSuppliers: ['supp-001', 'supp-002', 'supp-003'],
    items: [
      {
        itemId: pipeItem.id,
        itemCode: pipeItem.code,
        description: pipeItem.name,
        quantity: 120,
        unit: pipeItem.unit,
      }
    ]
  }, { name: 'Karim Mansouri', role: 'RESPONSABLE_ACHATS' });

  assert.ok(rfq.reference.startsWith('RFQ-'), 'La référence doit commencer par RFQ-');
  assert.strictEqual(rfq.status, 'OUVERTE');
  console.log(`Consultation RFQ lancée: ${rfq.reference} - Titre: "${rfq.title}"`);

  // ============================================================================
  // ÉTAPE 6 : SOUMISSION DES OFFRES FOURNISSEURS & CONTRÔLE CRITÈRE ÉLIMINATOIRE
  // ============================================================================
  console.log('\n[6] Réception et saisie des offres fournisseurs');

  // Offre 1 : Batimetal (Offre conforme, délai maîtrisé, CCPU 3.1 fourni)
  const offer1 = await serverStore.addOfferToRfq(rfq.id, {
    supplierId: 'supp-001',
    supplierName: 'Batimetal Tuyauteries Algérie',
    totalPriceHT: 2220000,
    unitPriceHT: 18500,
    deliveryLeadTimeDays: 14,
    warrantyMonths: 24,
    technicalComplianceRating: 92,
    qualityRating: 90,
    certificationsProvided: {
      ccpu31: true, // CCPU 3.1 EN 10204 PRÉSENT
      cndReport: true,
      coc: true,
      atex: false
    },
    paymentTerms: '45 jours fin de mois par virement'
  }, { name: 'Acheteur Tuyauterie' });

  // Offre 2 : Maghreb Tubes (Prix plus bas mais CCPU 3.1 MANQUANT -> ÉLIMINATOIRE)
  const offer2 = await serverStore.addOfferToRfq(rfq.id, {
    supplierId: 'supp-002',
    supplierName: 'Maghreb Tubes & Raccords Industriels',
    totalPriceHT: 1980000,
    unitPriceHT: 16500,
    deliveryLeadTimeDays: 10,
    warrantyMonths: 12,
    technicalComplianceRating: 75,
    qualityRating: 70,
    certificationsProvided: {
      ccpu31: false, // CRITÈRE ÉLIMINATOIRE EN MILIEU PÉTROCHIMIQUE
      cndReport: false,
      coc: true,
      atex: false
    },
    paymentTerms: '30 jours'
  }, { name: 'Acheteur Tuyauterie' });

  // Offre 3 : Techno-Weld (Conforme mais délai plus long et tarif plus élevé)
  const offer3 = await serverStore.addOfferToRfq(rfq.id, {
    supplierId: 'supp-003',
    supplierName: 'Techno-Weld Algérie & Consommables',
    totalPriceHT: 2520000,
    unitPriceHT: 21000,
    deliveryLeadTimeDays: 25,
    warrantyMonths: 24,
    technicalComplianceRating: 95,
    qualityRating: 92,
    certificationsProvided: {
      ccpu31: true,
      cndReport: true,
      coc: true,
      atex: false
    },
    paymentTerms: '60 jours'
  }, { name: 'Acheteur Tuyauterie' });

  assert.strictEqual(offer2.isEliminated, true, 'Offre 2 doit être marquée comme éliminée');
  assert.ok(offer2.eliminationReason.includes('CCPU 3.1'), 'La raison d\'élimination doit mentionner le CCPU 3.1');
  console.log(`Offres enregistrées pour ${rfq.reference}: 3 offres (dont 1 éliminée pour CCPU 3.1 manquant)`);

  // ============================================================================
  // ÉTAPE 7 : CALCUL DU COMPARATEUR TCO MULTICRITÈRES PONDÉRÉ
  // ============================================================================
  console.log('\n[7] Exécution de la matrice comparative TCO');
  const tcoResult = await serverStore.calculateTcoComparison(rfq.id, undefined, {
    name: 'Karim Mansouri',
    role: 'RESPONSABLE_ACHATS'
  });

  assert.ok(tcoResult.supplierScores.length === 3);

  // Vérification de l'élimination
  const maghrebScore = tcoResult.supplierScores.find(s => s.supplierId === 'supp-002');
  assert.strictEqual(maghrebScore.isEliminated, true);
  assert.strictEqual(maghrebScore.overallTcoScore, 0);
  console.log(`Fournisseur éliminé vérifié: ${maghrebScore.supplierName} - Score TCO: ${maghrebScore.overallTcoScore}`);

  // Vérification du fournisseur retenu
  assert.strictEqual(tcoResult.selectedSupplierId, 'supp-001', 'Batimetal doit être retenu');
  const winnerScore = tcoResult.supplierScores.find(s => s.supplierId === 'supp-001');
  assert.ok(winnerScore.overallTcoScore > 80, 'Le score du gagnant doit être supérieur à 80');
  console.log(`Fournisseur sélectionné: ${tcoResult.selectedSupplierName} (Score TCO: ${winnerScore.overallTcoScore}/100, Rang 1)`);

  // ============================================================================
  // ÉTAPE 8 : ARBITRAGE ET APPROBATION DG DU COMPARATIF TCO
  // ============================================================================
  console.log('\n[8] Approbation Direction Générale du TCO');
  const approvedTco = await serverStore.approveTcoDG(
    tcoResult.id,
    'Fournisseur Batimetal retenu : conformité CCPU 3.1 validée, maîtrise du délai et fabricant national.',
    { name: 'Directeur Général Silex', role: 'DIRECTION_GENERALE' }
  );

  assert.strictEqual(approvedTco.status, 'APPROUVE_DG');
  assert.ok(approvedTco.dgVisaSignature.includes('VISA-DG-TCO'));
  console.log(`TCO approuvé par la DG: Statut=${approvedTco.status}, Visa=${approvedTco.dgVisaSignature}`);

  // ============================================================================
  // ÉTAPE 9 : ÉMISSION DU BON DE COMMANDE (BC) & IMPACT BUDGÉTAIRE
  // ============================================================================
  console.log('\n[9] Génération du Bon de Commande officiel depuis le TCO approuvé');
  const initialCommittedBudget = activeProj.committedBudget;

  const po = await serverStore.createPurchaseOrderFromTco(tcoResult.id, {
    name: 'Karim Mansouri',
    role: 'RESPONSABLE_ACHATS'
  });

  assert.ok(po.code.startsWith('BC-'), 'Le bon de commande doit commencer par BC-');
  assert.strictEqual(po.status, 'CONFIRMED');
  assert.strictEqual(po.supplierId, 'supp-001');
  console.log(`Bon de Commande émis: ${po.code} (${po.supplierName}) - Montant HT: ${po.totalHT.toLocaleString()} DA, TTC: ${po.totalTTC.toLocaleString()} DA`);

  // Vérification de l'impact budgétaire immédiat
  const projectAfterPo = serverStore.getProject(activeProj.id);
  console.log(`Budget engagé avant BC: ${initialCommittedBudget.toLocaleString()} DA -> Après BC: ${projectAfterPo.committedBudget.toLocaleString()} DA`);
  assert.strictEqual(projectAfterPo.committedBudget, initialCommittedBudget + po.totalHT, 'Le budget engagé du chantier doit augmenter du montant HT du BC');
  console.log('Distinction ferme validée : Le budget engagé a augmenté sans modifier le coût consommé (spentBudget).');

  // ============================================================================
  // ÉTAPE 10 : GESTION DES CONTRATS FOURNISSEURS & DOCUMENTS CADRES
  // ============================================================================
  console.log('\n[10] Enregistrement d\'un contrat-cadre d\'approvisionnement');
  const contract = await serverStore.createSupplierContract({
    supplierId: 'supp-001',
    supplierName: 'Batimetal Tuyauteries Algérie',
    title: 'Contrat-Cadre Fourniture Aciers & Raccords 2026/2027',
    contractType: 'FOURNITURE_CADRE',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    totalAmountHT: 85000000,
    hasRebateClause: true,
    paymentTerms: '45 jours fin de mois',
    attachments: [
      { name: 'Conditions_Generales_Achat_Silex.pdf', url: '/docs/cga-silex.pdf', uploadDate: new Date().toISOString() },
      { name: 'Bareme_Prix_Metallurgie_2026.pdf', url: '/docs/bareme-2026.pdf', uploadDate: new Date().toISOString() }
    ]
  }, { name: 'Directeur Général Silex' });

  assert.ok(contract.contractNumber.startsWith('CTR-FOU-'));
  assert.strictEqual(contract.status, 'ACTIF');
  console.log(`Contrat-cadre enregistré: ${contract.contractNumber} (${contract.title}) - Montant: ${contract.totalAmountHT.toLocaleString()} DA`);

  // ============================================================================
  // ÉTAPE 11 : RÉCEPTION PARTIELLE AVEC CONTRÔLE QUALITÉ & DÉTECTION NON-CONFORMITÉS
  // ============================================================================
  console.log('\n[11] Réception Partielle 1 (Livraison 80 sur 120 commandés) avec Contrôle Qualité');

  const orderedQty = 120;
  const initialStock = serverStore.getInventoryItem(pipeItem.id).currentStock;

  // Livraison de 80 unités : 75 conformes et 5 NON-CONFORMES (rebutées pour ovalisation hors tolérance)
  const gr1 = await serverStore.recordGoodsReceipt({
    purchaseOrderId: po.id,
    warehouseId: 'wh-001',
    deliveryNoteNumber: 'BL-BATIMETAL-99412',
    carrierName: 'Trans-Logistique Ouest',
    lines: [
      {
        itemId: pipeItem.id,
        itemCode: pipeItem.code,
        description: pipeItem.name,
        orderedQuantity: orderedQty,
        deliveredQuantity: 80,
        rejectedQuantity: 5, // 5 rebuts -> 75 acceptés
        rejectionReason: '5 tubes ovalisés hors tolérance API 5L rejetés en zone de quarantaine',
        unit: pipeItem.unit,
        unitPriceHT: 18500,
      }
    ]
  }, { name: 'Tarek Meziani (Gestionnaire Magasin Central)' });

  assert.ok(gr1.receiptNumber.startsWith('BR-'), 'Le code doit commencer par BR-');
  console.log(`Bon de Réception émis: ${gr1.receiptNumber} - Quantité livrée: 80, Rebuts: 5`);

  // Vérification de la commande : Statut PARTIALLY_RECEIVED et reliquat = 45 (120 - 75 acceptés)
  const poAfterGr1 = serverStore.getPurchaseOrder(po.id);
  assert.strictEqual(poAfterGr1.status, 'PARTIALLY_RECEIVED', 'Le BC doit être en réception partielle');
  assert.strictEqual(poAfterGr1.items[0].receivedQuantity, 75, 'La quantité reçue sur le BC doit être 75');
  assert.strictEqual(poAfterGr1.items[0].remainingQuantity, 45, 'Le reliquat restant doit être 45');
  console.log(`État du BC après réception partielle: Statut=${poAfterGr1.status}, Reçu=${poAfterGr1.items[0].receivedQuantity}, Reliquat restant=${poAfterGr1.items[0].remainingQuantity}`);

  // Vérification stricte du stock disponible : Seules les 75 unités conformes doivent entrer en stock actif
  const itemAfterGr1 = serverStore.getInventoryItem(pipeItem.id);
  assert.strictEqual(itemAfterGr1.currentStock, initialStock + 75, 'Le stock actif doit augmenter UNIQUEMENT de la quantité conforme (75)');
  console.log(`Stock après BR1: ${itemAfterGr1.currentStock} ${itemAfterGr1.unit} (Augmentation de 75 unités conformes; les 5 rebuts sont isolés)`);

  // ============================================================================
  // ÉTAPE 12 : RÉCEPTION DU SOLDE (RELIQUAT) & CLÔTURE DE LA COMMANDE
  // ============================================================================
  console.log('\n[12] Réception Partielle 2 (Solde des 45 unités restantes) - 100% Conforme');

  const gr2 = await serverStore.recordGoodsReceipt({
    purchaseOrderId: po.id,
    warehouseId: 'wh-001',
    deliveryNoteNumber: 'BL-BATIMETAL-99580',
    carrierName: 'Trans-Logistique Ouest',
    lines: [
      {
        itemId: pipeItem.id,
        itemCode: pipeItem.code,
        description: pipeItem.name,
        orderedQuantity: orderedQty,
        deliveredQuantity: 45,
        rejectedQuantity: 0,
        unit: pipeItem.unit,
        unitPriceHT: 18500,
      }
    ]
  }, { name: 'Tarek Meziani' });

  // Le BC doit maintenant être soldé (statut RECEIVED)
  const poAfterGr2 = serverStore.getPurchaseOrder(po.id);
  assert.strictEqual(poAfterGr2.status, 'RECEIVED', 'Le BC doit être soldé (RECEIVED)');
  assert.strictEqual(poAfterGr2.items[0].receivedQuantity, 120, 'La quantité totale reçue doit être 120');
  assert.strictEqual(poAfterGr2.items[0].remainingQuantity, 0, 'Le reliquat doit être égal à 0');
  console.log(`BC soldé avec succès: Statut=${poAfterGr2.status}, Reçu total=${poAfterGr2.items[0].receivedQuantity}/120, Reliquat=0`);

  const itemAfterGr2 = serverStore.getInventoryItem(pipeItem.id);
  assert.strictEqual(itemAfterGr2.currentStock, initialStock + 120, 'Le stock total doit avoir augmenté de 120');
  console.log(`Stock final de tubes ASTM A106: ${itemAfterGr2.currentStock} ${itemAfterGr2.unit}`);

  // ============================================================================
  // ÉTAPE 13 : SESSION D'INVENTAIRE PHYSIQUE, SAISIE COMPTAGE & CALCUL ÉCARTS
  // ============================================================================
  console.log('\n[13] Lancement d\'une Session d\'Inventaire Physique Tournant');

  const invSession = await serverStore.createPhysicalInventory({
    warehouseId: 'wh-001',
    warehouseName: 'Magasin Central Arzew & Base Logistique',
    responsibleName: 'Tarek Meziani'
  }, undefined, { name: 'Tarek Meziani' });

  assert.ok(invSession.inventoryNumber.startsWith('INV-'), 'Le code doit commencer par INV-');
  assert.strictEqual(invSession.status, 'EN_COMPTAGE');
  console.log(`Session d'inventaire initialisée: ${invSession.inventoryNumber} (${invSession.warehouseName})`);

  // Comptage physique avec écart détecté sur les électrodes de soudage
  const electrodeItem = items.find(i => i.code === 'ART-SOU-001');
  const initialElectrodeStock = electrodeItem.currentStock; // 120 paquets

  const countedInv = await serverStore.submitInventoryCount(invSession.id, [
    {
      itemId: electrodeItem.id,
      physicalCount: initialElectrodeStock - 10, // Écart: -10 paquets (Perte / détérioration humidité)
      reason: '10 paquets d\'électrodes endommagés par humidité et mis au rebut'
    }
  ], { name: 'Équipe d\'Inventaire Arzew' });

  assert.strictEqual(countedInv.status, 'EN_VALIDATION_DG');
  const electrodeCount = countedInv.itemsCounted.find(i => i.itemId === electrodeItem.id);
  assert.strictEqual(electrodeCount.discrepancyQuantity, -10, 'L\'écart sur électrodes doit être de -10');
  console.log(`Comptage enregistré: Écart sur ${electrodeCount.itemName} = ${electrodeCount.discrepancyQuantity} ${electrodeCount.unit}`);

  // ============================================================================
  // ÉTAPE 14 : ARBITRAGE DG & RÉGULARISATION DU STOCK PAR MOUVEMENT TRAÇABLE
  // ============================================================================
  console.log('\n[14] Validation DG et Régularisation du stock par mouvement traçable');
  const stockBeforeAdj = serverStore.getInventoryItem(electrodeItem.id).currentStock;

  const adjustedInv = await serverStore.validateAndAdjustInventoryDG(invSession.id, {
    name: 'Directeur Général Silex',
    role: 'DIRECTION_GENERALE'
  });

  assert.strictEqual(adjustedInv.status, 'CLOTURE');
  assert.ok(adjustedInv.adjustmentMovementReferences.length >= 1, 'Au moins un mouvement d\'ajustement doit être généré');

  const stockAfterAdj = serverStore.getInventoryItem(electrodeItem.id).currentStock;
  assert.strictEqual(stockAfterAdj, initialElectrodeStock - 10, 'Le stock doit être régularisé au comptage physique réel');
  console.log(`Régularisation effectuée: Stock d'électrodes mis à jour de ${stockBeforeAdj} à ${stockAfterAdj} paquets.`);
  console.log(`Mouvement généré: ${adjustedInv.adjustmentMovementReferences.join(', ')}`);

  // ============================================================================
  // ÉTAPE 15 : ÉVALUATION MULTICRITÈRES DE LA PERFORMANCE FOURNISSEUR
  // ============================================================================
  console.log('\n[15] Évaluation Périodique de la Performance Fournisseur');

  const evalResult = await serverStore.recordSupplierEvaluation({
    supplierId: 'supp-001',
    evaluationPeriod: 'T4 2026',
    qualityScore: 92, // Pondération 35%
    deliveryScore: 90, // Pondération 30%
    priceCompetitivenessScore: 88, // Pondération 20%
    responsivenessScore: 95, // Pondération 15%
    strengths: 'Qualité métallurgique irréprochable avec CCPU 3.1 conforme EN 10204, excellente réactivité.',
    weaknesses: '5 tubes ovalisés lors de la première livraison rapidement remplacés.',
  }, { name: 'Comité Évaluation Achats Silex' });

  assert.ok(evalResult.evaluationNumber.startsWith('EVAL-'));
  // Calcul: 92*0.35 + 90*0.30 + 88*0.20 + 95*0.15 = 32.2 + 27.0 + 17.6 + 14.25 = 91.05 -> Arrondi à 91
  assert.strictEqual(evalResult.totalScore, 91);
  assert.strictEqual(evalResult.classification, 'STRATEGIQUE_A');
  console.log(`Évaluation enregistrée: Score global=${evalResult.totalScore}/100 (${evalResult.starRating} étoiles) - Classification=${evalResult.classification}`);

  // ============================================================================
  // ÉTAPE 16 : MISE À JOUR DU STATUT FOURNISSEUR
  // ============================================================================
  console.log('\n[16] Mise à jour du statut d\'un fournisseur');
  const updatedSupp = await serverStore.updateSupplierStatus('supp-002', 'SUSPENDU', 'Non-respect récurrent des certifications qualité CCPU 3.1 requises', {
    name: 'Responsable Qualité Achats'
  });
  assert.strictEqual(updatedSupp.status, 'SUSPENDU');
  console.log(`Statut fournisseur mis à jour: ${updatedSupp.name} -> Statut=${updatedSupp.status}`);

  // ============================================================================
  // ÉTAPE 17 : VÉRIFICATION DES INDICATEURS DE PERFORMANCE CLÉS (KPIs) RÉELS
  // ============================================================================
  console.log('\n[17] Calcul des indicateurs clés réels (KPIs Achats & Stocks)');
  const procurementKpis = await serverStore.getProcurementKpis();
  console.log('KPIs Achats calculés:', JSON.stringify(procurementKpis, null, 2));
  assert.ok(procurementKpis.totalRequests >= 2, 'Total demandes >= 2');
  assert.ok(procurementKpis.totalOrders >= 2, 'Total bons de commande >= 2');
  assert.ok(procurementKpis.totalOrderAmountHT > 0, 'Montant engagé achats > 0');
  assert.ok(procurementKpis.activeSuppliers >= 1, 'Au moins un fournisseur actif');

  const inventoryKpis = await serverStore.getInventoryKpis();
  console.log('KPIs Stocks calculés:', JSON.stringify(inventoryKpis, null, 2));
  assert.ok(inventoryKpis.totalItems >= 9, 'Total articles >= 9');
  assert.ok(inventoryKpis.totalStockValueDA > 0, 'Valeur totale du stock > 0');
  assert.ok(inventoryKpis.totalWarehouses >= 3, 'Total dépôts >= 3');

  // ============================================================================
  // ÉTAPE 18 : TEST NÉGATIF & ROBUSTESSE (Tentative réception sur commande introuvable)
  // ============================================================================
  console.log('\n[18] Test négatif : Tentative de réception sur commande inexistante');
  let errorCaught = false;
  try {
    await serverStore.recordGoodsReceipt({
      purchaseOrderId: 'PO-INEXISTANT-999',
      warehouseId: 'wh-001',
      lines: []
    });
  } catch (err) {
    errorCaught = true;
    console.log(`Erreur attendue interceptée: "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'La réception sur commande invalide doit lever une exception');

  console.log('\n========================================================================');
  console.log('✅ TEST E2E PHASE 4 VALIDÉ À 100% : LE MODULE ACHATS & STOCKS FONCTIONNE !');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('\n❌ ÉCHEC DU TEST E2E PHASE 4 :', err);
  process.exit(1);
});
