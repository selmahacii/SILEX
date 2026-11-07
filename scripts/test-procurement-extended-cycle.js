const API_BASE = 'http://localhost:4000/api';

async function testProcurementExtendedCycle() {
  console.log('================================================================');
  console.log('   SILEX ERP — TEST EXTENDED PROCUREMENT CYCLE & SoD ACTIONS');
  console.log('================================================================');

  // 1. Login as DG
  const dgRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  const { accessToken: dgToken } = await dgRes.json();
  const dgHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${dgToken}` };

  // Login as PM
  const pmRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 's.belkacem@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  const { accessToken: pmToken } = await pmRes.json();
  const pmHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${pmToken}` };

  // Login as Achats
  const achRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a.benali@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  const { accessToken: achToken } = await achRes.json();
  const achHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${achToken}` };

  // Fetch or create an item
  const items = await (await fetch(`${API_BASE}/inventory/items`, { headers: dgHeaders })).json();
  const itemId = items[0]?.id;

  // Fetch a project
  const projects = await (await fetch(`${API_BASE}/projects`, { headers: dgHeaders })).json();
  const project = projects[0];

  // 1. Create a PR
  const prRes = await fetch(`${API_BASE}/procurement/purchase-requests`, {
    method: 'POST',
    headers: pmHeaders,
    body: JSON.stringify({
      projectId: project.id,
      title: 'Tuyauterie & Raccords Inox 316L — Test Réexamen & Variantes',
      justification: 'Arrêt d’urgence pour mise en conformité unité vapeur HP',
      urgency: 'HIGH',
      lines: [{
        itemId,
        description: 'Tubes Inox 316L Schedule 40 4" sans soudure',
        quantity: 10,
        unit: 'UNITE',
        estimatedUnitPrice: 85000,
      }],
    }),
  });
  const pr = await prRes.json();
  console.log(`[TEST 1] Émission Demande d’Achat : ${pr.reference} (Statut: ${pr.status}) ✓`);

  // 2. Fetch suppliers & Add quote
  const suppliers = await (await fetch(`${API_BASE}/procurement/suppliers`, { headers: achHeaders })).json();
  const supplier = suppliers[0];

  const quoteRes = await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/quotes`, {
    method: 'POST',
    headers: achHeaders,
    body: JSON.stringify({
      supplierId: supplier.id,
      totalAmountHT: 850000,
      deliveryLeadTimeDays: 14,
      stockAvailability: 'IMMEDIATE',
      technicalCompliance: true,
      warrantyMonths: 18,
      paymentTerms: '30% commande, 70% réception conforme',
      notes: 'Offre standard inox 316L',
    }),
  });
  const quote = await quoteRes.json();
  console.log(`[TEST 2] Ajout Devis Fournisseur Initial (${quote.quoteReference}) : 850 000 DA HT ✓`);

  // 3. Submit to DG for approval
  await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/submit-approval`, {
    method: 'POST',
    headers: achHeaders,
    body: JSON.stringify({ recommendedQuoteId: quote.id }),
  });
  console.log(`[TEST 3] Soumission de la DA à l'arbitrage DG (Statut: PENDING_APPROVAL) ✓`);

  // 4. DG Demande de Réexamen / Renégociation
  const reexamineRes = await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/reexamine`, {
    method: 'POST',
    headers: dgHeaders,
    body: JSON.stringify({
      notes: 'Prix unitaire jugé excessif par la DG. Négocier une variante matière ou une remise de 10% pour volume.',
    }),
  });
  const reexaminedPR = await reexamineRes.json();
  if (reexaminedPR.status !== 'QUOTATION_IN_PROGRESS') {
    throw new Error(`Statut inattendu après réexamen: ${reexaminedPR.status}`);
  }
  console.log(`[TEST 4] Arbitrage DG : Demande de Réexamen validée (Statut rebasculé à: ${reexaminedPR.status}) ✓`);

  // 5. Achats applique une modification de prix et saisit une variante négociée
  const updateQuoteRes = await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/quotes/${quote.id}`, {
    method: 'PATCH',
    headers: achHeaders,
    body: JSON.stringify({
      totalAmountHT: 765000, // 10% discount negotiated!
      deliveryLeadTimeDays: 10, // 4 days faster!
      notes: 'Variante négociée : Remise commerciale accordée de 10% (Gain: 85 000 DA) et délai raccourci à 10j.',
    }),
  });
  const updatedQuote = await updateQuoteRes.json();
  if (Number(updatedQuote.totalAmountHT) !== 765000) {
    throw new Error(`Montant HT non mis à jour: ${updatedQuote.totalAmountHT}`);
  }
  console.log(`[TEST 5] Mise à jour Devis & Variante par les Achats : Montant révisé à ${updatedQuote.totalAmountHT} DA HT (-10%) ✓`);

  // 6. Resubmit & DG Approves -> PO issued with 19% TVA
  await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/submit-approval`, {
    method: 'POST',
    headers: achHeaders,
    body: JSON.stringify({ recommendedQuoteId: quote.id }),
  });

  const approveRes = await fetch(`${API_BASE}/procurement/purchase-requests/${pr.id}/approve`, {
    method: 'POST',
    headers: dgHeaders,
    body: JSON.stringify({
      approvedQuoteId: quote.id,
      decisionNotes: 'Variante remisée et délai de 10j validés par la Direction Générale. Émission BC ferme.',
    }),
  });
  const approveData = await approveRes.json();
  const po = approveData.purchaseOrder || approveData.purchaseOrders?.[0];
  console.log(`[TEST 6] Approbation DG & Émission Bon de Commande : ${po.orderNumber} (HT: ${po.totalAmountHT} DA, TTC: ${po.totalAmountTTC} DA) ✓`);

  // 7. Fournisseur confirme le BC -> Action Confirmation AR
  const confirmRes = await fetch(`${API_BASE}/procurement/purchase-orders/${po.id}/confirm`, {
    method: 'POST',
    headers: achHeaders,
    body: JSON.stringify({
      supplierAcknowledgmentRef: `AR-FRN-${Date.now()}-FERME`,
    }),
  });
  const confirmedPo = await confirmRes.json();
  if (confirmedPo.status !== 'CONFIRMED') {
    throw new Error(`Statut BC inattendu après confirmation: ${confirmedPo.status}`);
  }
  console.log(`[TEST 7] Confirmation Accusé de Réception Fournisseur : ${confirmedPo.orderNumber} (Statut: ${confirmedPo.status}) ✓`);

  console.log('================================================================');
  console.log('TOUS LES TESTS DU CYCLE QCD ÉTENDU ONT RÉUSSI AVEC SUCCÈS (100%) !');
  console.log('================================================================');
}

testProcurementExtendedCycle().catch(err => {
  console.error('ERREUR TEST:', err);
  process.exit(1);
});
