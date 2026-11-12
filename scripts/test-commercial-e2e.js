const path = require('path');
const assert = require('assert');

async function run() {
  console.log('=== TEST E2E: MODULE 01 COMMERCIAL SARL SILEX SERVICES ===');

  const { serverStore } = require('../apps/web/src/lib/server-store');

  console.log('\n[1] Vérification de l\'initialisation du catalogue commercial');
  const initialKpis = await serverStore.getCommercialKpis();
  console.log('KPIs initiaux:', JSON.stringify(initialKpis, null, 2));
  assert.ok(initialKpis.totalOpportunities >= 1, 'Au moins une opportunité baseline doit exister');
  assert.ok(initialKpis.pendingCostSheetsCount >= 1, 'Au moins une fiche baseline en attente DG');

  console.log('\n[2] Création d\'une nouvelle opportunité commerciale (Lead / Appel d\'offres)');
  const newOpp = await serverStore.createOpportunity({
    clientName: 'Sonatrach - Direction Centrale Raffinage',
    contactPerson: 'M. Belkacem Hadj',
    contactEmail: 'b.hadj@sonatrach.dz',
    contactPhone: '+213 21 54 88 00',
    title: 'Arrêt Technique 2026 — Tuyauterie Haute Pression & Chaudronnerie',
    domain: 'tuyauterie-chaudronnerie-isolation',
    estimatedBudget: 45000000,
    source: 'APPEL_OFFRES',
    notes: 'Consultation restreinte pour révision échangeurs et collecteurs Skikda',
  });
  console.log(`Opportunité créée: ${newOpp.code} (ID: ${newOpp.id}) - ${newOpp.title}`);
  assert.ok(['BROUILLON', 'NOUVELLE', 'QUALIFIE'].includes(newOpp.status));
  assert.strictEqual(newOpp.clientName, 'Sonatrach - Direction Centrale Raffinage');

  console.log('\n[3] Création de la Fiche de Coût Collaborative rattachée');
  const newSheet = await serverStore.createCostSheet({
    opportunityId: newOpp.id,
    opportunityCode: newOpp.code,
    title: 'Arrêt Technique 2026 Skikda - Lot Tuyauterie HP',
    clientName: newOpp.clientName,
    sector: 'OIL_AND_GAS',
    siteLocation: 'Zone Industrielle Skikda - Unité 100',
    durationDays: 75,
  }, { id: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' });

  console.log(`Fiche de coût créée: ${newSheet.reference} (Statut: ${newSheet.status})`);
  assert.strictEqual(newSheet.status, 'BROUILLON');
  assert.strictEqual(newSheet.opportunityId, newOpp.id);

  console.log('\n[4] Contribution Département 1: PROJET (Planning, site, durées, moyens)');
  const updatedByProject = await serverStore.updateCostSheetContribution(
    newSheet.id,
    'PROJECT',
    {
      worksDescription: 'Dépose tuyauteries corrodées, préfabrication spools atelier, montage sur site et épreuves hydrauliques.',
      durationDays: 75,
      technicalMeans: 'Grue 50T, camions bras, postes TIG Miller, échafaudages Layher',
      constraints: 'Travaux en zone ATEX, co-activité avec arrêt unité catalytique, respect des permis de feu Sonatrach',
      lines: [
        {
          id: 'line-prj-1',
          department: 'PROJET',
          category: 'PRESTATION_PROJET',
          designation: 'Mise à disposition et montage échafaudages sécurisés',
          quantity: 1,
          unit: 'forfait',
          unitPrice: 1500000,
          totalAmount: 1500000,
          notes: 'Hauteur 18m autour de la tour de distillation',
        },
      ]
    },
    { id: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' }
  );
  console.log(`Contribution Projet enregistrée avec succès. Completed: ${updatedByProject.projectContribution.completed}`);
  assert.strictEqual(updatedByProject.projectContribution.completed, true);

  console.log('\n[5] Contribution Département 2: ACHATS (Tubes, vannes, locations et sous-traitance)');
  const updatedByProc = await serverStore.updateCostSheetContribution(
    newSheet.id,
    'PROCUREMENT',
    {
      procurementNotes: 'Fournisseurs métallurgie consultés : tubes certifiés 3.1 sous 3 semaines.',
      equipmentRentalAmount: 3500000, // Location grue et compresseurs HP
      subcontractingAmount: 2000000, // Contrôles non destructifs radio/ressuage
      lines: [
        {
          id: 'line-ach-1',
          department: 'ACHATS',
          category: 'FOURNITURE_MATIERE',
          designation: 'Tubes acier carbone A106 Gr B sch 80 sans soudure',
          quantity: 450,
          unit: 'ml',
          unitPrice: 20000,
          totalAmount: 9000000,
          supplierName: 'Tubacex Algérie',
        },
        {
          id: 'line-ach-2',
          department: 'ACHATS',
          category: 'FOURNITURE_MATIERE',
          designation: 'Robinetterie industrielle & clapets haute pression DN150/DN200',
          quantity: 25,
          unit: 'u',
          unitPrice: 200000,
          totalAmount: 5000000,
          supplierName: 'PetroValve SPA',
        },
      ]
    },
    { id: 'usr-ach-001', name: 'Farouk Brahimi', role: 'RESPONSABLE_ACHATS' }
  );
  console.log(`Contribution Achats enregistrée. Completed: ${updatedByProc.procurementContribution.completed}`);
  assert.strictEqual(updatedByProc.procurementContribution.completed, true);
  // Achats lines: 9M + 5M = 14M + rentals 3.5M + subcon 2M = 19.5M DZD

  console.log('\n[6] Contribution Département 3: RESSOURCES HUMAINES (Effectifs, compétences, hébergement)');
  const updatedByHR = await serverStore.updateCostSheetContribution(
    newSheet.id,
    'HR',
    {
      headcount: 32,
      mobilizationDays: 75,
      teamExpensesAmount: 2200000, // Déplacement, hébergement base de vie, restauration
      lines: [
        {
          id: 'line-rh-1',
          department: 'RH',
          category: 'MAIN_DOEUVRE_DIRECTE',
          designation: 'Tuyauteurs industriels qualifiés (8 tuyauteurs x 75 jours)',
          quantity: 600,
          unit: 'h/j',
          unitPrice: 8000,
          totalAmount: 4800000,
        },
        {
          id: 'line-rh-2',
          department: 'RH',
          category: 'MAIN_DOEUVRE_DIRECTE',
          designation: 'Soudeurs haute pression 6G GTAW/SMAW certifiés Sonatrach (6 soudeurs x 75 jours)',
          quantity: 450,
          unit: 'h/j',
          unitPrice: 9000,
          totalAmount: 4050000,
        },
        {
          id: 'line-rh-3',
          department: 'RH',
          category: 'MAIN_DOEUVRE_DIRECTE',
          designation: 'Superviseur de travaux & animateur sécurité HSE dédié',
          quantity: 75,
          unit: 'j',
          unitPrice: 12000,
          totalAmount: 900000,
        },
      ]
    },
    { id: 'usr-rh-001', name: 'Sabrina Haddad', role: 'RESPONSABLE_RH' }
  );
  console.log(`Contribution RH enregistrée. Completed: ${updatedByHR.hrContribution.completed}`);
  assert.strictEqual(updatedByHR.hrContribution.completed, true);
  // HR lines total: 4.8M + 4.05M + 0.9M = 9,750,000 DZD

  console.log('\n[7] Contribution Département 4: FINANCE (Rentabilité, risques, marge)');
  const updatedByFin = await serverStore.updateCostSheetContribution(
    newSheet.id,
    'FINANCE',
    {
      targetMarginPercent: 25, // 25% de marge
      financingNeedAmount: 6000000,
      paymentTermsEstimated: 'Avance 20% à la commande, situations mensuelles 60 jours',
      financialRiskRating: 'FAIBLE',
      feasibilityOpinion: 'FAVORABLE',
      financeNotes: 'Client solvable (Sonatrach). Nécessite caution bancaire de restitution d\'acompte 20%.',
    },
    { id: 'usr-fin-001', name: 'Réda Bouzid', role: 'RESPONSABLE_FINANCIER' }
  );
  console.log(`Contribution Finance enregistrée. Completed: ${updatedByFin.financeContribution.completed}`);
  assert.strictEqual(updatedByFin.financeContribution.completed, true);

  console.log('\n[8] Vérification des calculs financiers automatiques');
  // Procurement total: 9M + 5M + 3.5M + 2M = 19,500,000 DZD
  // Labor total: 4.8M + 4.05M + 0.9M = 9,750,000 DZD
  // Direct cost total: 19,500,000 + 9,750,000 = 29,250,000 DZD
  console.log(`- Coût Direct Calculé: ${updatedByFin.totalDirectCost} DZD (Attendu: 29,250,000 DZD)`);
  assert.strictEqual(updatedByFin.totalDirectCost, 29250000);

  // Indirect cost: Team expenses (2,200,000) + FG 5% direct cost (29,250,000 * 0.05 = 1,462,500) = 3,662,500 DZD
  const expectedIndirect = 2200000 + Math.round(29250000 * 0.05);
  console.log(`- Coût Indirect Calculé: ${updatedByFin.totalIndirectCost} DZD (Attendu: ${expectedIndirect} DZD)`);
  assert.strictEqual(updatedByFin.totalIndirectCost, expectedIndirect);

  // Total estimated cost: 29,250,000 + 3,662,500 = 32,912,500 DZD
  const expectedTotalCost = 29250000 + expectedIndirect;
  console.log(`- Coût Total Chantier: ${updatedByFin.totalEstimatedCost} DZD (Attendu: ${expectedTotalCost} DZD)`);
  assert.strictEqual(updatedByFin.totalEstimatedCost, expectedTotalCost);

  // Proposed selling price: totalEstimatedCost / (1 - 0.25) = totalEstimatedCost / 0.75
  const expectedSelling = Math.round(expectedTotalCost / 0.75);
  console.log(`- Prix de Vente HT Proposé: ${updatedByFin.proposedSellingPrice} DZD (Attendu: ${expectedSelling} DZD)`);
  assert.strictEqual(updatedByFin.proposedSellingPrice, expectedSelling);

  // Check state after all 4 contributions
  console.log(`- Statut de la fiche: ${updatedByFin.status} (Attendu: PRETE_POUR_VALIDATION)`);
  assert.strictEqual(updatedByFin.status, 'PRETE_POUR_VALIDATION');

  console.log('\n[9] Soumission de la Fiche de Coût pour Arbitrage DG');
  const submittedSheet = await serverStore.submitCostSheetToDG(
    newSheet.id,
    { id: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' }
  );
  console.log(`Statut après soumission: ${submittedSheet.status}`);
  assert.strictEqual(submittedSheet.status, 'EN_ATTENTE_DG');

  console.log('\n[10] Arbitrage Direction Générale (Validation et ajustement de marge)');
  const arbitratedSheet = await serverStore.arbitrateCostSheet(
    newSheet.id,
    'VALIDEE',
    'Dossier technique et financier validé par la Direction Générale. Marge cible portée à 28% compte tenu de la criticité du délai.',
    28, // DG ajuste la marge à 28%
    { id: 'usr-dg-001', name: 'Kamel Rahmani (DG)', role: 'DIRECTEUR_GENERAL' }
  );
  console.log(`Statut après arbitrage DG: ${arbitratedSheet.status}`);
  console.log(`Décision DG: ${arbitratedSheet.dgDecision}`);
  console.log(`Marge arbitrée: ${arbitratedSheet.targetMarginPercent}%`);
  console.log(`Nouveau Prix de Vente: ${arbitratedSheet.proposedSellingPrice} DZD`);
  assert.strictEqual(arbitratedSheet.status, 'VALIDEE');
  assert.strictEqual(arbitratedSheet.dgDecision, 'APPROVED');
  assert.strictEqual(arbitratedSheet.targetMarginPercent, 28);
  const expectedNewSelling = Math.round(expectedTotalCost / (1 - 0.28));
  assert.strictEqual(arbitratedSheet.proposedSellingPrice, expectedNewSelling);

  console.log('\n[11] Génération du Devis Client Officiel (CustomerQuote)');
  const quote = await serverStore.createCustomerQuoteFromCostSheet(
    newSheet.id,
    {
      validityDays: 60,
      paymentTerms: '20% avance à l\'OS, situations mensuelles selon attachements contradictoires, 10% retenue de garantie',
      scopeSummary: 'Travaux de réhabilitation tuyauterie HP et chaudronnerie sur arrêt unité 100 Skikda.',
      notes: 'Garantie de parfait achèvement 12 mois. Assurance responsabilité civile décennale incluse.',
    },
    { id: 'usr-dg-001', name: 'Kamel Rahmani (DG)', role: 'DIRECTEUR_GENERAL' }
  );
  console.log(`Devis généré: N° ${quote.quoteNumber} (Statut: ${quote.status})`);
  console.log(`Montant HT: ${quote.amountHT} DZD, TVA (19%): ${quote.tvaAmount} DZD, TTC: ${quote.amountTTC} DZD`);
  assert.strictEqual(quote.status, 'ENVOYE');
  assert.strictEqual(quote.amountHT, arbitratedSheet.proposedSellingPrice);
  assert.strictEqual(quote.tvaAmount, Math.round(quote.amountHT * 0.19));
  assert.strictEqual(quote.amountTTC, quote.amountHT + quote.tvaAmount);

  console.log('\n[12] Conversion de l\'affaire en Projet Industriel Actif (Passage en Phase Réalisation)');
  const projectCreated = await serverStore.convertCostSheetToProject(
    newSheet.id,
    { id: 'usr-dg-001', name: 'Kamel Rahmani (DG)', role: 'DIRECTEUR_GENERAL' }
  );
  console.log(`Projet créé avec succès: Code=${projectCreated.code}, Nom="${projectCreated.name}"`);
  console.log(`Budget alloué: ${projectCreated.budgetAmount} DZD, Montant Contrat: ${projectCreated.contractAmount} DZD`);
  assert.ok(['PLANNING', 'EN_COURS', 'ACTIVE'].includes(projectCreated.status));
  assert.strictEqual(projectCreated.budgetAmount, arbitratedSheet.totalEstimatedCost);
  assert.strictEqual(projectCreated.contractAmount, arbitratedSheet.proposedSellingPrice);
  assert.strictEqual(projectCreated.clientName, arbitratedSheet.clientName);

  console.log('\n[13] Vérification de l\'IDEMPOTENCE de la conversion en projet');
  const projectSecondCall = await serverStore.convertCostSheetToProject(
    newSheet.id,
    { id: 'usr-dg-001', name: 'Kamel Rahmani (DG)', role: 'DIRECTEUR_GENERAL' }
  );
  console.log(`Deuxième appel retourne le projet existant ID: ${projectSecondCall.id}`);
  assert.strictEqual(projectSecondCall.id, projectCreated.id, 'L\'idempotence doit empêcher la création de doublons');

  console.log('\n[14] Vérification de la mise à jour des statuts opportunité et fiches');
  const finalOpp = await serverStore.getOpportunity(newOpp.id);
  console.log(`Statut opportunité final: ${finalOpp.status} (Attendu: GAGNEE)`);
  assert.strictEqual(finalOpp.status, 'GAGNEE');

  const finalKpis = await serverStore.getCommercialKpis();
  console.log('KPIs finaux après conversion:', JSON.stringify(finalKpis, null, 2));
  assert.ok(finalKpis.totalWonValue >= arbitratedSheet.proposedSellingPrice);

  console.log('\n===============================================================');
  console.log('✅ TEST E2E VALIDÉ À 100% : LE CYCLE COMMERCIAL COMPLET FONCTIONNE !');
  console.log('===============================================================');
}

run().catch((err) => {
  console.error('❌ ECHEC DU TEST E2E:', err);
  process.exit(1);
});
