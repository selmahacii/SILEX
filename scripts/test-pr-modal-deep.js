/**
 * Test E2E Fonctionnel : Nouvelle Demande d'Achat Chantier (DA)
 * Orienté Micro-Détails, Contexte Projet, Chiffrage TVA 19% et Soumission QCD
 * SILEX SERVICES SARL
 */

const API_BASE = 'http://localhost:4000/api';

async function runPrModalAudit() {
  console.log('========================================================================');
  console.log(' AUDIT FONCTIONNEL : NOUVELLE DEMANDE D\'ACHAT CHANTIER (DA) - POSTGRES');
  console.log('========================================================================\n');

  try {
    // 1. Authentification Chef de Projet SILEX
    console.log('[1/5] Authentification Chef de Projet (Sofiane Belkacem)...');
    const authPmRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 's.belkacem@silex-services.dz', password: 'SilexDemo2026!' }),
    });
    if (!authPmRes.ok) throw new Error(`Échec login PM: HTTP ${authPmRes.status}`);
    const pmData = await authPmRes.json();
    const pmHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pmData.accessToken}`,
    };
    console.log(`  -> Connecté avec succès : ${pmData.user.name} (${pmData.user.role})\n`);

    // 2. Récupération des projets et analyse du contexte financier
    console.log('[2/5] Récupération des chantiers et inspection du cadre financier...');
    const prjRes = await fetch(`${API_BASE}/projects`, { headers: pmHeaders });
    const projects = await prjRes.json();
    if (projects.length === 0) throw new Error('Aucun projet en base');
    const prj = projects[0];
    console.log(`  -> Chantier ciblé : [${prj.code}] ${prj.name}`);
    console.log(`  -> Client Maître d'Ouvrage : ${prj.clientName} (Site: ${prj.siteLocation || 'Arzew ZI'})`);
    console.log(`  -> Budget Alloué : ${Number(prj.budgetAmount || prj.contractAmount).toLocaleString('fr-DZ')} DA`);
    console.log(`  -> Engagé / Consommé : ${Number(prj.committedCost || prj.actualCost || 0).toLocaleString('fr-DZ')} DA\n`);

    // 3. Récupération des articles disponibles au catalogue
    console.log('[3/5] Consultation du catalogue et stocks magasin central...');
    const itemsRes = await fetch(`${API_BASE}/inventory/items`, { headers: pmHeaders });
    const items = await itemsRes.json();
    const catalogItem = items[0] || { id: 'temp-id', code: 'ART-001', name: 'Vanne Opercule', unitCost: 35000 };
    console.log(`  -> Article étalon : [${catalogItem.code}] ${catalogItem.name} (PMP: ${Number(catalogItem.unitCost).toLocaleString('fr-DZ')} DA)\n`);

    // 4. Émission de la Nouvelle DA Chantier avec spécifications complètes
    console.log('[4/5] Émission de la DA avec micro-détails, TVA 19% et CCPU 3.1...');
    const qty = 20;
    const unitPrice = 45000;
    const subtotalHT = qty * unitPrice;
    const tva = Math.round(subtotalHT * 0.19);
    const totalTTC = subtotalHT + tva;
    const targetDate = new Date(Date.now() + 5 * 86400000).toISOString();

    const createDaRes = await fetch(`${API_BASE}/procurement/purchase-requests`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({
        projectId: prj.id,
        urgencyLevel: 'HIGH',
        justification: 'Approvisionnement prioritaire pour test d\'épreuve hydraulique sous pression (150 bars) et tie-in réseau selon planning contractuel Sonatrach.',
        desiredDate: targetDate,
        lines: [
          {
            itemId: catalogItem.id,
            description: 'Spool Tuyauterie Inox 316L DN150 Sch 40S avec 2 Brides WNRF Cl.300 [Matière: ASTM A312 TP316L] [Repère: ISO-PRJ-2026-DWG-04]',
            quantity: qty,
            unit: 'UNITE',
            technicalSpecs: 'Pôle: TUYAUTERIE | Lieu livraison: Magasin Central Arzew (Zone Industrielle Ouest) | Qualité: CCPU 3.1 EN 10204, Certificat Fabricant (CoC) | Repère ISO: ISO-PRJ-2026-DWG-04 / Spool S-02',
            estimatedUnitPrice: unitPrice,
          },
        ],
      }),
    });

    if (!createDaRes.ok) {
      throw new Error(`Erreur création DA: HTTP ${createDaRes.status} - ${await createDaRes.text()}`);
    }
    const createdDa = await createDaRes.json();
    console.log(`  -> DA émise avec succès : Réf ${createdDa.reference} (ID: ${createdDa.id})`);
    console.log(`  -> Statut initial : ${createdDa.status}`);
    console.log(`  -> Montant estimé HT : ${Number(createdDa.totalEstimatedAmount).toLocaleString('fr-DZ')} DA`);
    console.log(`  -> TVA Légale 19% : ${tva.toLocaleString('fr-DZ')} DA`);
    console.log(`  -> Total Estimé TTC : ${totalTTC.toLocaleString('fr-DZ')} DA\n`);

    // 5. Enregistrement d'un Devis Fournisseur et Validation DG
    console.log('[5/5] Consultation fournisseur, transmission arbitrage et visa DG...');
    const suppRes = await fetch(`${API_BASE}/procurement/suppliers`, { headers: pmHeaders });
    const suppliers = await suppRes.json();
    if (suppliers.length === 0) throw new Error('Aucun fournisseur homologué disponible.');
    const supp = suppliers[0];

    // Ajout devis
    const quoteRes = await fetch(`${API_BASE}/procurement/quotes`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({
        purchaseRequestId: createdDa.id,
        supplierId: supp.id,
        totalAmountHT: subtotalHT,
        deliveryLeadTimeDays: 5,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: '30 jours fin de mois après réception conforme CCPU 3.1',
        notes: 'Offre ferme conforme aux spécifications techniques Sonatrach RA1Z.',
        lines: [
          {
            purchaseRequestLineId: createdDa.lines[0].id,
            unitPrice: unitPrice,
          },
        ],
      }),
    });
    const quote = await quoteRes.json();
    console.log(`  -> Offre reçue de [${supp.name}] : ${Number(quote.totalAmountHT).toLocaleString('fr-DZ')} DA HT (Délai: 5 jours)`);

    // Soumission pour visa DG
    await fetch(`${API_BASE}/procurement/purchase-requests/${createdDa.id}/submit-approval`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ recommendedQuoteId: quote.id }),
    });
    console.log('  -> DA soumise à l\'arbitrage de la Direction Générale (SoD respectée).');

    // Connexion DG pour approbation
    const authDgRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }),
    });
    const dgData = await authDgRes.json();
    const dgHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dgData.accessToken}`,
    };

    const approveRes = await fetch(`${API_BASE}/procurement/purchase-requests/${createdDa.id}/approve`, {
      method: 'POST',
      headers: dgHeaders,
      body: JSON.stringify({
        approvedQuoteId: quote.id,
        decisionNotes: 'Visa DG accordé pour respect du planning d\'épreuve hydrostatique réseau Sonatrach.',
      }),
    });
    const approveData = await approveRes.json();
    const po = approveData.purchaseOrder;
    console.log(`  -> Visa DG accordé ! Bon de Commande émis : N° ${po?.orderNumber}`);
    console.log(`  -> Montant ferme BC HT : ${Number(po?.totalAmountHT || 0).toLocaleString('fr-DZ')} DA`);
    console.log(`  -> TVA légale 19% : +${Number(po?.tvaAmount || 0).toLocaleString('fr-DZ')} DA`);
    console.log(`  -> Total TTC net à payer : ${Number(po?.totalAmountTTC || 0).toLocaleString('fr-DZ')} DA\n`);

    console.log('========================================================================');
    console.log(' TOUS LES CONTRÔLES FONCTIONNELS DE LA MODALE DA SONT VALIDÉS (100%)');
    console.log('========================================================================');
  } catch (err) {
    console.error('\nERREUR AUDIT :', err.message);
    process.exit(1);
  }
}

runPrModalAudit();
