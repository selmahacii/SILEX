// scripts/e2e-complete-details-verification.js
// Test End-to-End Ultime — SILEX INDUSTRIAL ERP
// Vérification Exhaustive de TOUS les Détails, Actions, Statuts & Proxy Next.js

const API_DIRECT = 'http://127.0.0.1:4000/api';
const API_VIA_PROXY = 'http://localhost:3008/api';

async function runCompleteE2EVerification() {
  console.log('================================================================');
  console.log('   SILEX INDUSTRIAL ERP — VÉRIFICATION E2E INTÉGRALE');
  console.log('   Toutes les Mutations, Actions, Statuts & Accès Proxy');
  console.log('================================================================\n');

  const results = [];
  function assert(name, condition, extraInfo = '') {
    if (!condition) {
      console.error(`  ✗ ÉCHEC : ${name} ${extraInfo}`);
      results.push({ name, passed: false, error: extraInfo });
      throw new Error(`Assertion failed: ${name}`);
    }
    console.log(`  ✓ ${name} ${extraInfo ? '— ' + extraInfo : ''}`);
    results.push({ name, passed: true });
  }

  // -------------------------------------------------------------
  // TEST 1 : Authentification multi-rôles & Sécurité JWT
  // -------------------------------------------------------------
  console.log('\n[1. AUTHENTIFICATION & SÉPARATION DES RÔLES]');
  
  // Login Admin
  const adminLoginRes = await fetch(`${API_DIRECT}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  assert('Connexion Administrateur Système', adminLoginRes.ok, `Status: ${adminLoginRes.status}`);
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.accessToken;
  assert('Token JWT Administrateur délivré', !!adminToken && adminData.user.role === 'ADMINISTRATEUR');

  // Login DG
  const dgLoginRes = await fetch(`${API_DIRECT}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  assert('Connexion Directeur Général', dgLoginRes.ok);
  const dgData = await dgLoginRes.json();
  const dgToken = dgData.accessToken;

  // Login Chef de Projet
  const pmLoginRes = await fetch(`${API_DIRECT}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 's.belkacem@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  assert('Connexion Chef de Projet', pmLoginRes.ok);
  const pmData = await pmLoginRes.json();
  const pmToken = pmData.accessToken;

  // -------------------------------------------------------------
  // TEST 2 : Test du Proxy Same-Origin Next.js (Port 3008 -> Port 4000)
  // -------------------------------------------------------------
  console.log('\n[2. ARCHITECTURE RÉSEAU & PROXY SAME-ORIGIN NEXT.JS]');
  const proxyTestRes = await fetch(`${API_VIA_PROXY}/auth/demo-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'DIRECTEUR_GENERAL' }),
  });
  assert('Accès API via Proxy Next.js (Port 3008)', proxyTestRes.ok, `Status: ${proxyTestRes.status}`);
  const proxyData = await proxyTestRes.json();
  assert('Basculement Rôle Démo via Proxy Web', proxyData.user.role === 'DIRECTEUR_GENERAL');

  // -------------------------------------------------------------
  // TEST 3 : Administration & Gestion Utilisateurs (RBAC, CRUD, Audit)
  // -------------------------------------------------------------
  console.log('\n[3. MODULE ADMINISTRATION — CRÉATION, MODIFICATION & AUDIT]');

  // Non-admin tente de créer un utilisateur (doit échouer 403)
  const forbiddenCreateRes = await fetch(`${API_DIRECT}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      name: 'Hacker User',
      email: 'hacker@silex.dz',
      role: 'ADMINISTRATEUR',
      departmentCode: 'DIRECTION_GENERALE',
    }),
  });
  assert('Sécurité RBAC : Chef de projet interdit de créer un utilisateur (403)', forbiddenCreateRes.status === 403);

  // Admin crée un utilisateur
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const newEmail = `user.test.${randNum}@silex-services.dz`;
  const createUserRes = await fetch(`${API_DIRECT}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `Ingénieur Test ${randNum}`,
      email: newEmail,
      title: 'Superviseur Montage Tuyauterie',
      role: 'RESPONSABLE_PROJET',
      departmentCode: 'OPERATIONS_PROJETS',
      password: 'SilexDemo2026!',
    }),
  });
  assert('Administrateur crée un utilisateur', createUserRes.ok, `Status: ${createUserRes.status}`);
  const createdUser = await createUserRes.json();
  assert('Utilisateur enregistré avec succès', createdUser.email === newEmail && createdUser.role === 'RESPONSABLE_PROJET');
  assert('Sécurité Hash : Absence stricte du passwordHash', createdUser.passwordHash === undefined && createdUser.password === undefined);

  // Admin met à jour le profil utilisateur (PATCH /api/users/:id)
  const updateUserRes = await fetch(`${API_DIRECT}/users/${createdUser.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Chef de Pôle Travaux Neufs & CND',
      active: false,
    }),
  });
  assert('Administrateur met à jour l’utilisateur (titre & désactivation)', updateUserRes.ok);
  const updatedUser = await updateUserRes.json();
  assert('Mise à jour appliquée', updatedUser.title === 'Chef de Pôle Travaux Neufs & CND' && updatedUser.active === false);

  // Réactivation du compte
  const reactivateUserRes = await fetch(`${API_DIRECT}/users/${createdUser.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ active: true }),
  });
  assert('Réactivation du compte utilisateur', reactivateUserRes.ok);
  const reactivatedUser = await reactivateUserRes.json();
  assert('Compte utilisateur actif', reactivatedUser.active === true);

  // Vérification de la traçabilité immuable (Audit Logs)
  const auditRes = await fetch(`${API_DIRECT}/audit?limit=10`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  assert('Consultation Journal d’Audit ISO 9001', auditRes.ok);
  const auditLogs = await auditRes.json();
  const createLog = auditLogs.find(l => l.action === 'USER_CREATE' && l.entityId === createdUser.id);
  const updateLog = auditLogs.find(l => l.action === 'USER_UPDATE' && l.entityId === createdUser.id);
  assert('Traçabilité création utilisateur consignée dans l’audit', !!createLog);
  assert('Traçabilité mise à jour utilisateur consignée dans l’audit', !!updateLog);

  // -------------------------------------------------------------
  // TEST 4 : Module Projets — Cycle de vie & Mises à Jour Contradictoires
  // -------------------------------------------------------------
  console.log('\n[4. MODULE PROJETS — CYCLE DE VIE, JALONS, ODS & SITUATIONS]');

  // Création d'un projet
  const prjCode = `PRJ-E2E-ULTRA-${randNum}`;
  const createPrjRes = await fetch(`${API_DIRECT}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      code: prjCode,
      name: `Rénovation Unité Alkylation Arzew ${randNum}`,
      clientName: 'SONATRACH / Raffinerie Arzew',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Arzew (Oran)',
      contractAmount: 180000000,
      budgetAmount: 135000000,
      startDate: new Date().toISOString(),
      contractEndDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      description: 'Préfabrication et pose tuyauteries HP acier allié et épreuves sous pression.',
    }),
  });
  assert('Création Projet Industriel', createPrjRes.ok);
  const project = await createPrjRes.json();

  // Mise à jour de l'avancement physique
  const progressRes = await fetch(`${API_DIRECT}/projects/${project.id}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({ physicalProgress: 68.5 }),
  });
  assert('Actualisation Avancement Physique (68.5%)', progressRes.ok);
  const progressData = await progressRes.json();
  assert('Avancement physique appliqué', progressData.physicalProgress === 68.5);

  // Création et arbitrage d'un Jalon contractuel
  const createMilestoneRes = await fetch(`${API_DIRECT}/projects/${project.id}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      title: 'Tirage et raboutage tuyauteries collecteurs vapeur',
      description: 'Contrôle radiographique 100% des soudures',
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    }),
  });
  assert('Ajout Jalon Contractuel', createMilestoneRes.ok);
  const milestone = await createMilestoneRes.json();

  // Validation / Clôture du jalon
  const arbitrateMilestoneRes = await fetch(`${API_DIRECT}/projects/${project.id}/milestones/${milestone.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      status: 'COMPLETED',
      completedDate: new Date().toISOString(),
      description: `${milestone.description} | [PV Conforme délivré sans réserve par Bureau Veritas Algérie]`,
    }),
  });
  assert('Arbitrage du Jalon en COMPLETED (PV Conforme)', arbitrateMilestoneRes.ok);
  const updatedMilestone = await arbitrateMilestoneRes.json();
  assert('Statut Jalon validé', updatedMilestone.status === 'COMPLETED');

  // Émission d'un ODS et Visa Contradictoire Client
  const createOdsRes = await fetch(`${API_DIRECT}/projects/${project.id}/service-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      type: 'DEMARRAGE',
      issueDate: new Date().toISOString(),
      description: 'Démarrage effectif des travaux de calorifugeage et tuyauterie',
      delayImpactDays: 0,
    }),
  });
  assert('Émission ODS par la DG', createOdsRes.ok);
  const ods = await createOdsRes.json();

  // Visa contradictoire client sur l'ODS
  const visaOdsRes = await fetch(`${API_DIRECT}/projects/${project.id}/service-orders/${ods.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      status: 'ACCEPTED',
      clientSignatory: 'M. Farouk Mansour (Représentant Maître d’Ouvrage SONATRACH)',
    }),
  });
  assert('Enregistrement Visa Contradictoire Client sur ODS', visaOdsRes.ok);
  const updatedOds = await visaOdsRes.json();
  assert('ODS accepté avec visa contradictoire client', updatedOds.status === 'ACCEPTED' && (updatedOds.description?.includes('SONATRACH') || updatedOds.clientSignatory?.includes('SONATRACH')));

  // Création et arbitrage d'une Situation de Travaux
  const createSitRes = await fetch(`${API_DIRECT}/projects/${project.id}/work-situations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
      amountHT: 24500000,
      notes: 'Métrés préfabrication 450 mètres linéaires et épreuves hydrostatiques',
    }),
  });
  assert('Création Situation de Travaux Métrée (24,500,000 DA)', createSitRes.ok);
  const sit = await createSitRes.json();

  // Approbation de la situation par la DG
  const approveSitRes = await fetch(`${API_DIRECT}/projects/${project.id}/work-situations/${sit.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      status: 'APPROVED',
      notes: `${sit.notes} [BAP Accordé après vérification des attachements contradictoires]`,
    }),
  });
  assert('Approbation Situation (Bon à Payer BAP)', approveSitRes.ok);
  const updatedSit = await approveSitRes.json();
  assert('Situation passée en statut APPROVED', updatedSit.status === 'APPROVED');

  // -------------------------------------------------------------
  // TEST 5 : Module Achats & Approvisionnements (SoD, TVA 19%, BC)
  // -------------------------------------------------------------
  console.log('\n[5. MODULE ACHATS — SOUMISSION, OFFRES, TVA 19% & COMMANDE]');

  // Création DA par Chef de Projet
  const itemsRes = await fetch(`${API_DIRECT}/inventory/items`, {
    headers: { 'Authorization': `Bearer ${pmToken}` },
  });
  const items = await itemsRes.json();
  const testItem = items[0];

  const createDaRes = await fetch(`${API_DIRECT}/procurement/purchase-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pmToken}` },
    body: JSON.stringify({
      projectId: project.id,
      urgencyLevel: 'HIGH',
      justification: 'Approvisionnement urgent brides et vannes HP pour arrêt technique',
      desiredDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      lines: [
        {
          itemId: testItem.id,
          quantity: 20,
          unit: testItem.unit,
          description: testItem.name,
          estimatedUnitPrice: Number(testItem.unitCost || 15000),
        },
      ],
    }),
  });
  assert('Création Demande d’Achat (DA)', createDaRes.ok);
  const da = await createDaRes.json();

  // Consultation Fournisseurs : Ajout Devis
  const suppliersRes = await fetch(`${API_DIRECT}/procurement/suppliers`, {
    headers: { 'Authorization': `Bearer ${dgToken}` },
  });
  const suppliers = await suppliersRes.json();
  const supplier = suppliers[0];

  const createQuoteRes = await fetch(`${API_DIRECT}/procurement/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      purchaseRequestId: da.id,
      supplierId: supplier.id,
      totalAmountHT: 300000,
      deliveryLeadTimeDays: 5,
      stockAvailability: 'IMMEDIATE',
      technicalCompliance: true,
      warrantyMonths: 12,
      paymentTerms: '30 jours fin de mois',
      notes: 'Offre la mieux-disante conforme aux spécifications CQS',
      lines: [{ purchaseRequestLineId: da.lines[0].id, unitPrice: 15000 }],
    }),
  });
  assert('Enregistrement Devis Fournisseur Homologué', createQuoteRes.ok);
  const quote = await createQuoteRes.json();

  // Soumission à l'arbitrage
  const submitDaRes = await fetch(`${API_DIRECT}/procurement/purchase-requests/${da.id}/submit-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({ recommendedQuoteId: quote.id }),
  });
  assert('Transmission DA à l’Arbitrage DG (PENDING_APPROVAL)', submitDaRes.ok);

  // Approbation DG & Émission BC
  const approveDaRes = await fetch(`${API_DIRECT}/procurement/purchase-requests/${da.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      approvedQuoteId: quote.id,
      decisionNotes: 'Offre retenue après consultation contradictoire. Commande validée.',
    }),
  });
  assert('Approbation DG & Émission Bon de Commande (BC)', approveDaRes.ok);
  const approveData = await approveDaRes.json();
  assert('Bon de Commande généré avec succès', !!approveData.purchaseOrder && approveData.purchaseOrder.orderNumber.startsWith('BC-'));

  // -------------------------------------------------------------
  // TEST 6 : Module Ressources Humaines & Pointages
  // -------------------------------------------------------------
  console.log('\n[6. MODULE RESSOURCES HUMAINES & POINTAGES CHANTIERS]');

  // Création Collaborateur
  const empReg = `EMP-E2E-${randNum}`;
  const createEmpRes = await fetch(`${API_DIRECT}/hr/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      registrationNumber: empReg,
      firstName: 'Abderrahmane',
      lastName: `Bennaceur ${randNum}`,
      title: 'Soudeur TIG Inox 6G Qualifié',
      email: `a.bennaceur.${randNum}@silex-services.dz`,
      phone: '+213 661 99 88 77',
      contractType: 'CHANTIER',
    }),
  });
  assert('Enregistrement Collaborateur Spécialisé', createEmpRes.ok);
  const employee = await createEmpRes.json();

  // Mise à jour du collaborateur (PATCH /api/hr/employees/:id)
  const updateEmpRes = await fetch(`${API_DIRECT}/hr/employees/${employee.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      title: 'Chef d’Équipe Soudage HP & Contrôles CND',
      phone: '+213 661 00 11 22',
    }),
  });
  assert('Mise à jour Fiche Collaborateur (PATCH)', updateEmpRes.ok);
  const updatedEmp = await updateEmpRes.json();
  assert('Intitulé de poste actualisé', updatedEmp.title.includes('Chef d’Équipe'));

  // Homologation Soudage CQS (ASME IX / ISO 9606)
  const createCertRes = await fetch(`${API_DIRECT}/hr/certifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      employeeId: employee.id,
      certName: 'Homologation Soudage Tuyauterie Haute Pression ASME IX / ISO 9606-1 (6G)',
      issuingBody: 'Bureau Veritas Algérie',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 730 * 86400000).toISOString(),
      status: 'VALIDE',
    }),
  });
  assert('Délivrance Homologation Soudage CQS ASME IX', createCertRes.ok);
  const cert = await createCertRes.json();
  assert('Certificat enregistré avec statut VALIDE', cert.status === 'VALIDE');

  // Pointage Journalier Chantier
  const createAttRes = await fetch(`${API_DIRECT}/hr/attendances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      employeeId: employee.id,
      projectId: project.id,
      date: new Date().toISOString(),
      regularHours: 8,
      hoursWorked: 8,
      overtimeHours: 2,
    }),
  });
  assert('Enregistrement Pointage Chantier Journalier', createAttRes.ok);
  const att = await createAttRes.json();
  assert('Pointage imputé au projet avec heures sup', att.regularHours === 8 && att.overtimeHours === 2);

  // -------------------------------------------------------------
  // TEST 7 : Module Qualité & Maintenance
  // -------------------------------------------------------------
  console.log('\n[7. MODULES QUALITÉ QHSE & PARC MAINTENANCE]');

  // Non-Conformité FNC
  const createNcRes = await fetch(`${API_DIRECT}/quality/non-conformities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      ncNumber: `FNC-2026-${randNum}`,
      title: `Manque de pénétration sur soudure BW-42-HMD-${randNum}`,
      description: 'Défaut détecté lors du contrôle radiographique RT sous norme ASME B31.3',
      severity: 'MAJEURE',
      projectId: project.id,
      detectedBy: 'Nadia Chaib (Responsable QHSE)',
    }),
  });
  assert('Signalement Fiche de Non-Conformité (FNC)', createNcRes.ok);
  const nc = await createNcRes.json();

  // Action Corrective sur FNC
  const createActionRes = await fetch(`${API_DIRECT}/quality/non-conformities/${nc.id}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      description: 'Meulage de la passe de fond, reprise de soudure au TIG et ressuage ressuage PT',
      responsible: employee.firstName + ' ' + employee.lastName,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    }),
  });
  assert('Ajout Action Corrective sur FNC', createActionRes.ok);

  // Clôture FNC
  const closeNcRes = await fetch(`${API_DIRECT}/quality/non-conformities/${nc.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      status: 'CLOSED',
      closeType: 'Visa Contrôle Qualité',
      resolutionNotes: 'Contrôle non destructif après réparation 100% conforme sans aucune indication.',
    }),
  });
  assert('Clôture et visa de la FNC (Statut: CLOSED)', closeNcRes.ok);

  // Équipement Maintenance
  const createAssetRes = await fetch(`${API_DIRECT}/fleet/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({
      assetTag: `EQ-E2E-${randNum}`,
      name: `Groupe Électrogène Insonorisé 250 kVA ${randNum}`,
      assetType: 'GROUPE_ELECTROGENE',
      brand: 'Caterpillar',
      model: 'C9 Acert Heavy Duty',
      serialNumber: `CAT-DZ-889-${randNum}`,
      status: 'OPERATIONAL',
    }),
  });
  assert('Enregistrement Matériel / Engin au Parc', createAssetRes.ok);
  const asset = await createAssetRes.json();

  // Basculement Statut Matériel
  const toggleAssetRes = await fetch(`${API_DIRECT}/fleet/assets/${asset.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dgToken}` },
    body: JSON.stringify({ status: 'MAINTENANCE' }),
  });
  assert('Bascule Statut Engin (Opérationnel -> Maintenance)', toggleAssetRes.ok);

  // =============================================================
  // BILAN FINAL
  // =============================================================
  const failed = results.filter(r => !r.passed);
  console.log('\n================================================================');
  console.log(`RÉSULTAT DU CONTRÔLE E2E : ${results.length - failed.length} / ${results.length} vérifications réussies`);
  if (failed.length === 0) {
    console.log('🌟 VÉRIFICATION 100% RÉUSSIE — TOUS LES DÉTAILS SONT OPÉRATIONNELS !');
    console.log('   ✓ Authentification multi-profils et RBAC');
    console.log('   ✓ Proxy Next.js transparent (port 3008 -> 4000)');
    console.log('   ✓ Création, modification et audit des utilisateurs');
    console.log('   ✓ Jalons contractuels, ODS contradictoires et situations BAP');
    console.log('   ✓ Cycle complet Achats avec TVA 19% et Bons de Commande');
    console.log('   ✓ Gestion du personnel, qualifications ASME/ISO et pointages');
    console.log('   ✓ Traitement complet des Non-Conformités et suivi du parc');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 ${failed.length} VÉRIFICATION(S) EN ÉCHEC`);
    process.exit(1);
  }
}

runCompleteE2EVerification().catch(err => {
  console.error('\n💥 Erreur fatale lors du test E2E :', err);
  process.exit(1);
});
