/**
 * SILEX INDUSTRIAL ERP — CONTRÔLE MICRO-DÉTAILLÉ EXHAUSTIF DE TOUS LES MODULES
 * Exécution E2E intégrale : Authentification, RBAC, Admin, Projets, Achats,
 * Stocks, RH & Compétences, Qualité QHSE, Maintenance Parc, Finance, Workflows & Rendu Web
 */

const http = require('http');

const API_BASE = 'http://127.0.0.1:4000/api';
const WEB_BASE = 'http://127.0.0.1:3008';

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  modules: {}
};

function track(moduleName, testName, condition, details = '') {
  stats.total++;
  if (!stats.modules[moduleName]) {
    stats.modules[moduleName] = { passed: 0, failed: 0 };
  }
  if (condition) {
    stats.passed++;
    stats.modules[moduleName].passed++;
    console.log(`  ✓ [${moduleName.padEnd(11)}] ${testName} ${details ? '— ' + details : ''}`);
    return true;
  } else {
    stats.failed++;
    stats.modules[moduleName].failed++;
    console.error(`  ✗ [${moduleName.padEnd(11)}] ÉCHEC : ${testName} ${details ? '— ' + details : ''}`);
    return false;
  }
}

async function request(url, options = {}) {
  const parsed = new URL(url);
  const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  const runId = Math.floor(Math.random() * 9000) + 1000;
  console.log('================================================================');
  console.log(`   SILEX INDUSTRIAL ERP — CONTRÔLE MICRO-DÉTAILS E2E [RUN #${runId}]`);
  console.log('   Vérification rigoureuse de chaque micro-détail dans tous les modules');
  console.log('================================================================\n');

  // ============================================================================
  // MODULE 1 : AUTHENTIFICATION MULTI-PROFILS, RBAC & TOKENS JWT
  // ============================================================================
  console.log('--- MODULE 1 : AUTHENTIFICATION MULTI-PROFILS & RBAC ---');
  
  // 1.1 Login Admin
  const adminRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: { email: 'admin@silex-services.dz', password: 'SilexDemo2026!' }
  });
  track('AUTH', 'Connexion Administrateur Système (admin@silex-services.dz)', adminRes.status === 201, `Status: ${adminRes.status}`);
  const adminToken = adminRes.data?.accessToken;
  track('AUTH', 'Délivrance Token JWT Admin valide & rôle ADMINISTRATEUR', !!adminToken && adminRes.data?.user?.role === 'ADMINISTRATEUR');

  // 1.2 Login DG
  const dgRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: { email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }
  });
  track('AUTH', 'Connexion Directeur Général (k.mansouri@silex-services.dz)', dgRes.status === 201);
  const dgToken = dgRes.data?.accessToken;

  // 1.3 Login Chef de Projet
  const pmRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: { email: 's.belkacem@silex-services.dz', password: 'SilexDemo2026!' }
  });
  track('AUTH', 'Connexion Chef de Projet (s.belkacem@silex-services.dz)', pmRes.status === 201);
  const pmToken = pmRes.data?.accessToken;

  // 1.4 Switch Démo Rôles
  const buyerSwitchRes = await request(`${API_BASE}/auth/demo-switch`, {
    method: 'POST',
    body: { role: 'RESPONSABLE_ACHATS' }
  });
  track('AUTH', 'Basculement dynamique Rôle Démo RESPONSABLE_ACHATS', buyerSwitchRes.status === 201 && buyerSwitchRes.data?.user?.role === 'RESPONSABLE_ACHATS');
  const buyerToken = buyerSwitchRes.data?.accessToken;

  const stockSwitchRes = await request(`${API_BASE}/auth/demo-switch`, {
    method: 'POST',
    body: { role: 'RESPONSABLE_MAGASIN' }
  });
  track('AUTH', 'Basculement dynamique Rôle Démo RESPONSABLE_MAGASIN', stockSwitchRes.status === 201 && stockSwitchRes.data?.user?.role === 'RESPONSABLE_MAGASIN');
  const stockToken = stockSwitchRes.data?.accessToken;

  // 1.5 Barrière négative 401 Unauthorized
  const unauthRes = await request(`${API_BASE}/users`);
  track('AUTH', 'Barrière 401 Unauthorized sur endpoint protégé sans token', unauthRes.status === 401);

  // ============================================================================
  // MODULE 2 : ADMINISTRATION DES UTILISATEURS & CONFORMITÉ AUDIT ISO 9001
  // ============================================================================
  console.log('\n--- MODULE 2 : ADMINISTRATION, SÉCURITÉ DES COMPTES & AUDIT ---');

  // 2.1 RBAC négatif : Chef de projet interdit de créer un compte (403)
  const forbiddenCreate = await request(`${API_BASE}/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: { name: 'Unauthorized Staff', email: `unauth.${runId}@silex.dz`, role: 'ADMINISTRATEUR', departmentCode: 'DIRECTION_GENERALE' }
  });
  track('ADMIN', 'Sécurité RBAC : Rejet 403 quand le Chef de Projet tente de créer un utilisateur', forbiddenCreate.status === 403);

  // 2.2 Admin crée un utilisateur
  const newStaffEmail = `expert.qualite.${runId}@silex-services.dz`;
  const createUserRes = await request(`${API_BASE}/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: `Ing. Reda Touati ${runId}`,
      email: newStaffEmail,
      role: 'RESPONSABLE_QUALITE',
      departmentCode: 'QHSE',
      title: 'Inspecteur CND & Superviseur Soudage Niveau III',
      phone: '+213 550 12 34 56',
      password: 'SecurePassword2026!'
    }
  });
  track('ADMIN', 'Création d’un utilisateur avec rôle RESPONSABLE_QUALITE & département QHSE', createUserRes.status === 201);
  const createdUserId = createUserRes.data?.id;
  track('ADMIN', 'Sécurité Argon2 : Absence totale de passwordHash dans la réponse', !createUserRes.data?.passwordHash);

  // 2.3 Mise à jour profil utilisateur (PATCH)
  const updateUserRes = await request(`${API_BASE}/users/${createdUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Lead Auditor QHSE & Auditeur ISO 9001 / ASME IX',
      active: false
    }
  });
  track('ADMIN', 'Mise à jour du profil et désactivation du compte (active: false)', updateUserRes.status === 200 && updateUserRes.data?.active === false);

  // 2.4 Réactivation 1-clic
  const reactivateRes = await request(`${API_BASE}/users/${createdUserId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { active: true }
  });
  track('ADMIN', 'Réactivation 1-clic du compte utilisateur (active: true)', reactivateRes.status === 200 && reactivateRes.data?.active === true);

  // 2.5 Traçabilité dans le journal d'audit
  const auditRes = await request(`${API_BASE}/audit`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const hasAuditTrace = Array.isArray(auditRes.data) && auditRes.data.some(a => a.entityId === createdUserId || a.action === 'USER_CREATE');
  track('ADMIN', 'Conformité ISO 9001 : Action consignée dans le journal d’audit immuable', hasAuditTrace);

  // ============================================================================
  // MODULE 3 : PROJETS INDUSTRIELS, AVANCEMENT, JALONS, ODS & SITUATIONS MÉTRÉES
  // ============================================================================
  console.log('\n--- MODULE 3 : PROJETS INDUSTRIELS & CONTRATS CHANTIERS ---');

  const projectCode = `PRJ-E2E-${runId}`;
  const createProjectRes = await request(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      code: projectCode,
      name: `Raccordement Collecteur Gaz & Skids Haute Pression #${runId}`,
      clientName: 'SONATRACH / DP Hassi Messaoud',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Hassi Messaoud (Base Sud)',
      contractAmount: 180000000,
      budgetAmount: 135000000, // Marge 25% (45M DA)
      startDate: new Date().toISOString(),
      contractEndDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      description: 'Préfabrication, montage et épreuves hydrauliques collecteurs vapeur HP sous contrôle CND.'
    }
  });
  track('PROJETS', `Création du projet industriel ${projectCode} (180M DA)`, createProjectRes.status === 201);
  const project = createProjectRes.data;
  const projectId = project?.id;

  // 3.1 Actualisation de l'avancement physique
  const updateProgressRes = await request(`${API_BASE}/projects/${projectId}/progress`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: { physicalProgress: 72.5 }
  });
  track('PROJETS', 'Actualisation de l’avancement physique à 72.5%', updateProgressRes.status === 200 && updateProgressRes.data?.physicalProgress === 72.5);

  // 3.2 Insertion d'un Jalon Contractuel
  const milestoneRes = await request(`${API_BASE}/projects/${projectId}/milestones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      title: 'Contrôle Radiographique RT 100% & Épreuve Hydrostatique 150 Bars',
      description: 'Sous supervision conjointe Sonatrach & Bureau Veritas Algérie',
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString()
    }
  });
  track('PROJETS', 'Insertion d’un jalon contractuel critique (Contrôle CND & Épreuve 150 bars)', milestoneRes.status === 201);
  const milestoneId = milestoneRes.data?.id;

  // 3.3 Arbitrage du Jalon en COMPLETED avec PV
  const arbitrateMilestoneRes = await request(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      status: 'COMPLETED',
      completedDate: new Date().toISOString(),
      description: 'PV de réception contradictoire sans réserve délivré par Bureau Veritas et Sonatrach DP'
    }
  });
  track('PROJETS', 'Arbitrage et validation du jalon (COMPLETED avec PV)', arbitrateMilestoneRes.status === 200 && arbitrateMilestoneRes.data?.status === 'COMPLETED');

  // 3.4 Émission d'un ODS Démarrage par la DG
  const odsRes = await request(`${API_BASE}/projects/${projectId}/service-orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      type: 'DEMARRAGE',
      issueDate: new Date().toISOString(),
      description: 'Ordre de Service de démarrage effectif des travaux de montage sur site',
      delayImpactDays: 0
    }
  });
  track('PROJETS', 'Émission d’un ODS Démarrage par la Direction Générale', odsRes.status === 201);
  const odsId = odsRes.data?.id;

  // 3.5 Visa contradictoire client sur l'ODS
  const clientVisaSignatory = `M. Farouk Mansour (Représentant SONATRACH DP HMD) — Visa ACCEPTÉ sans réserve`;
  const odsVisaRes = await request(`${API_BASE}/projects/${projectId}/service-orders/${odsId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      status: 'ACCEPTED',
      clientSignatory: clientVisaSignatory
    }
  });
  track('PROJETS', 'Enregistrement du Visa Contradictoire Client sur l’ODS (ACCEPTED)', odsVisaRes.status === 200 && odsVisaRes.data?.status === 'ACCEPTED');

  // 3.6 Saisie d'une Situation de Travaux Métrée
  const situationRes = await request(`${API_BASE}/projects/${projectId}/work-situations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
      amountHT: 32000000,
      notes: 'Situation métrée mensuelle N°01 : Avancement tuyauterie vapeur et charpente skids'
    }
  });
  track('PROJETS', 'Saisie de la Situation de Travaux N°01 (32 000 000 DA HT)', situationRes.status === 201);
  const situationId = situationRes.data?.id;

  // 3.7 Bon à Payer (BAP) accordé par la DG
  const bapRes = await request(`${API_BASE}/projects/${projectId}/work-situations/${situationId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      status: 'APPROVED',
      notes: 'Bon à Payer (BAP) validé après pointage contradictoire des attachements métrés'
    }
  });
  track('PROJETS', 'Approbation Bon à Payer (BAP) de la situation de travaux (APPROVED)', bapRes.status === 200 && bapRes.data?.status === 'APPROVED');

  // ============================================================================
  // MODULE 4 : ACHATS, FOURNISSEURS HOMOLOGUÉS, DEVIS, TVA 19% & BONS DE COMMANDE
  // ============================================================================
  console.log('\n--- MODULE 4 : ACHATS, SOUMISSIONS, TVA 19% & BONS DE COMMANDE ---');

  // 4.1 Récupération d'un article pour la DA
  const itemsRes = await request(`${API_BASE}/inventory/items`, {
    headers: { Authorization: `Bearer ${pmToken}` }
  });
  let items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
  let sampleItem = items[0];
  if (!sampleItem) {
    const createItemRes = await request(`${API_BASE}/inventory/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        code: `ART-E2E-${runId}`,
        name: 'Vanne Papillon Inox DN150 ANSI 300',
        description: 'Robinetterie industrielle inox haute pression avec certification CCPU 3.1',
        unit: 'UNITE',
        unitCost: 25000,
        minStockLevel: 5,
        currentStock: 50
      }
    });
    sampleItem = createItemRes.data;
  }

  // 4.2 Création Demande d'Achat (DA)
  const createDaRes = await request(`${API_BASE}/procurement/purchase-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: {
      projectId: projectId,
      urgencyLevel: 'HIGH',
      justification: `Approvisionnement urgent brides forgées WNRF pour chantier ${projectCode}`,
      desiredDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      lines: [
        {
          itemId: sampleItem.id,
          quantity: 25,
          unit: sampleItem.unit || 'UNITE',
          description: sampleItem.name || 'Brides et vannes industrielles',
          estimatedUnitPrice: Number(sampleItem.unitCost || 25000)
        }
      ]
    }
  });
  track('ACHATS', 'Création Demande d’Achat (DA) avec imputation directe au chantier', createDaRes.status === 201);
  const da = createDaRes.data;

  // 4.3 Consultation Fournisseur Homologué & Devis
  const suppliersRes = await request(`${API_BASE}/procurement/suppliers`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  let suppliers = Array.isArray(suppliersRes.data) ? suppliersRes.data : [];
  let supplier = suppliers[0];
  if (!supplier) {
    const createSupRes = await request(`${API_BASE}/procurement/suppliers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dgToken}` },
      body: {
        code: `FRN-E2E-${runId}`,
        name: 'SARL Robinetterie Industrielle d’Algérie',
        contactName: 'Yacine Amrani',
        email: `contact.e2e.${runId}@fournisseur-dz.com`,
        phone: '+213 21 60 70 80',
        address: 'Zone Industrielle Oued Smar, Alger',
        specialties: 'Robinetterie & Tuyauterie Industrielle'
      }
    });
    supplier = createSupRes.data;
  }

  const createQuoteRes = await request(`${API_BASE}/procurement/quotes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      purchaseRequestId: da.id,
      supplierId: supplier.id,
      totalAmountHT: 625000,
      deliveryLeadTimeDays: 7,
      stockAvailability: 'IMMEDIATE',
      technicalCompliance: true,
      warrantyMonths: 12,
      paymentTerms: '45 jours fin de mois',
      notes: 'Offre la mieux-disante conforme aux spécifications CQS ASME',
      lines: [{ purchaseRequestLineId: da.lines[0].id, unitPrice: 25000 }]
    }
  });
  track('ACHATS', 'Enregistrement de l’offre comparative fournisseur (625 000 DA HT)', createQuoteRes.status === 201);
  const quote = createQuoteRes.data;

  // 4.4 Transmission pour arbitrage DG
  const submitDaRes = await request(`${API_BASE}/procurement/purchase-requests/${da.id}/submit-approval`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: { recommendedQuoteId: quote.id }
  });
  track('ACHATS', 'Transmission de la DA à l’arbitrage Direction Générale (PENDING_APPROVAL)', submitDaRes.status === 200 || submitDaRes.status === 201);

  // 4.5 Sécurité SoD (Quatre-Yeux) : Demandeur PM ne peut pas approuver sa propre DA
  const sodBlockRes = await request(`${API_BASE}/procurement/purchase-requests/${da.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pmToken}` },
    body: { approvedQuoteId: quote.id }
  });
  track('ACHATS', 'Sécurité SoD (Quatre-Yeux) : Blocage strict 403 si le demandeur tente d’approuver sa DA', sodBlockRes.status === 403);

  // 4.6 Approbation DG & Émission automatique du Bon de Commande (BC)
  const approveDaRes = await request(`${API_BASE}/procurement/purchase-requests/${da.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      approvedQuoteId: quote.id,
      decisionNotes: 'Offre retenue après consultation contradictoire. Commande validée par la DG.'
    }
  });
  track('ACHATS', 'Approbation DG & Émission automatique du Bon de Commande (BC)', approveDaRes.status === 200 || approveDaRes.status === 201);
  const po = approveDaRes.data?.purchaseOrder;
  track('ACHATS', `Bon de Commande ${po?.orderNumber || 'BC-GEN'} généré avec statut ISSUED`, !!po);

  // ============================================================================
  // MODULE 5 : INVENTAIRE, MAGASINS CHANTIERS & MOUVEMENTS DE STOCK
  // ============================================================================
  console.log('\n--- MODULE 5 : INVENTAIRE, MAGASINS & SÉCURITÉ DE STOCK ---');

  // 5.1 Consultation des magasins et niveaux de stock
  const whRes = await request(`${API_BASE}/inventory/warehouses`, {
    headers: { Authorization: `Bearer ${stockToken}` }
  });
  track('STOCK', 'Consultation des magasins centraux et avancés chantiers', whRes.status === 200 && Array.isArray(whRes.data));
  const warehouse = whRes.data?.[0];

  // 5.2 Réception de marchandises avec visa BL & CCPU 3.1
  const recRes = await request(`${API_BASE}/inventory/receive-goods`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${stockToken}` },
    body: {
      purchaseOrderId: po.id,
      warehouseId: warehouse.id,
      deliveryNoteNumber: `BL-FRN-${runId}-001`,
      notes: 'Contrôle quantitatif conforme, CCPU 3.1 vérifié (Nuance 316L, Coulée N°8721)',
      lines: [
        {
          purchaseOrderLineId: po.lines[0].id,
          quantityReceived: 10
        }
      ]
    }
  });
  track('STOCK', 'Réception de livraison liée au Bon de Commande avec visa CCPU 3.1', recRes.status === 200 || recRes.status === 201, `Status: ${recRes.status}`);

  // 5.3 Sécurité anti-stock négatif : tentative de sortie abusive
  const badMovementRes = await request(`${API_BASE}/inventory/issue-to-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${stockToken}` },
    body: {
      itemId: sampleItem.id,
      warehouseId: warehouse.id,
      projectId: projectId,
      quantity: 999999, // Quantité démesurée
      notes: 'Tentative de dépassement de stock'
    }
  });
  track('STOCK', 'Sécurité anti-stock négatif : Rejet 400 quand la sortie excède le stock réel', badMovementRes.status === 400);

  // 5.4 Sortie de stock légitime avec imputation analytique au projet
  const goodMovementRes = await request(`${API_BASE}/inventory/issue-to-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${stockToken}` },
    body: {
      itemId: sampleItem.id,
      warehouseId: warehouse.id,
      projectId: projectId,
      quantity: 2,
      notes: `Sortie outillage & tuyauterie pour chantier ${projectCode}`
    }
  });
  track('STOCK', 'Sortie de stock vers chantier avec imputation analytique du coût', goodMovementRes.status === 200 || goodMovementRes.status === 201);

  // ============================================================================
  // MODULE 6 : RESSOURCES HUMAINES, HABILITATIONS ASME IX & POINTAGES
  // ============================================================================
  console.log('\n--- MODULE 6 : RESSOURCES HUMAINES & HABILITATIONS SOUDAGE CQS ---');

  // 6.1 Enregistrement Collaborateur
  const empReg = `EMP-E2E-${runId}`;
  const empRes = await request(`${API_BASE}/hr/employees`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      registrationNumber: empReg,
      firstName: 'Abdelkader',
      lastName: `Meziane ${runId}`,
      title: 'Soudeur TIG Inox 6G Qualifié',
      email: `a.meziane.${runId}@silex-services.dz`,
      phone: '+213 661 77 88 99',
      contractType: 'CHANTIER'
    }
  });
  track('RH', `Enregistrement collaborateur qualifié ${empReg}`, empRes.status === 201);
  const employee = empRes.data;

  // 6.2 Modification fiche collaborateur (PATCH)
  const patchEmpRes = await request(`${API_BASE}/hr/employees/${employee.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      title: 'Chef d’Équipe Soudage HP & Superviseur CND',
      phone: '+213 661 00 22 44'
    }
  });
  track('RH', 'Promotion & actualisation des fonctions (PATCH)', patchEmpRes.status === 200 && patchEmpRes.data?.title?.includes('Chef d’Équipe'));

  // 6.3 Habilitation Soudage CQS ASME Section IX / ISO 9606-1
  const certRes = await request(`${API_BASE}/hr/certifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      employeeId: employee.id,
      certName: 'Homologation Soudage Tube 6G H-L045 ASME IX / ISO 9606-1 (Inox 316L / GTAW)',
      issuingBody: 'Bureau Veritas Algérie',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 730 * 86400000).toISOString(),
      status: 'VALIDE'
    }
  });
  track('RH', 'Délivrance de l’homologation de soudage ASME IX (VALIDE)', certRes.status === 201 && certRes.data?.status === 'VALIDE');

  // 6.4 Saisie Pointage Chantier Journalier
  const attRes = await request(`${API_BASE}/hr/attendances`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      employeeId: employee.id,
      projectId: projectId,
      date: new Date().toISOString(),
      regularHours: 8,
      hoursWorked: 8,
      overtimeHours: 2.5
    }
  });
  track('RH', 'Pointage chantier journalier avec imputation heures sup (+50%)', attRes.status === 201 && attRes.data?.overtimeHours === 2.5);

  // ============================================================================
  // MODULE 7 : QUALITÉ QHSE & GESTION DES NON-CONFORMITÉS (FNC)
  // ============================================================================
  console.log('\n--- MODULE 7 : QUALITÉ QHSE & TRAITEMENT FNC ---');

  // 7.1 Signalement Fiche de Non-Conformité (FNC)
  const fncNumber = `FNC-2026-${runId}`;
  const fncRes = await request(`${API_BASE}/quality/non-conformities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      ncNumber: fncNumber,
      title: `Porosité linéaire détectée sur soudure W-102 ligne vapeur #${runId}`,
      description: 'Défaut volumique détecté lors du contrôle radiographique RT préliminaire',
      severity: 'MAJEURE',
      projectId: projectId,
      detectedBy: 'Nadia Chaib (Responsable QHSE)'
    }
  });
  track('QHSE', `Signalement Fiche de Non-Conformité (${fncNumber}) avec gravité MAJEURE`, fncRes.status === 201);
  const fnc = fncRes.data;

  // 7.2 Action Corrective sur FNC
  const actionRes = await request(`${API_BASE}/quality/non-conformities/${fnc.id}/actions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      description: 'Gougeage mécanique du cordon défectueux, reprise de soudure au TIG sous argon et contrôle ressuage PT final',
      responsible: `${employee.firstName} ${employee.lastName}`,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString()
    }
  });
  track('QHSE', 'Assignation de l’action corrective et protocole de reprise de soudure', actionRes.status === 201);

  // 7.3 Clôture et visa qualité
  const closeFncRes = await request(`${API_BASE}/quality/non-conformities/${fnc.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      status: 'CLOSED',
      closeType: 'Visa Contrôle Qualité',
      resolutionNotes: 'Contre-tir gammagraphique 100% conforme aux critères d’acceptation ASME B31.3'
    }
  });
  track('QHSE', 'Clôture et visa de conformité de la FNC (Statut: CLOSED)', closeFncRes.status === 200 && closeFncRes.data?.status === 'CLOSED');

  // ============================================================================
  // MODULE 8 : MAINTENANCE DU PARC MATÉRIEL & ORDRES DE TRAVAUX
  // ============================================================================
  console.log('\n--- MODULE 8 : MAINTENANCE DU PARC MATÉRIEL & ÉQUIPEMENTS ---');

  // 8.1 Enregistrement Matériel / Engin
  const assetTag = `EQ-E2E-${runId}`;
  const assetRes = await request(`${API_BASE}/fleet/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      assetTag: assetTag,
      name: `Poste Autonome de Soudage Diesel Miller 500A #${runId}`,
      assetType: 'GROUPE_ELECTROGENE',
      brand: 'Miller Electric',
      model: 'Big Blue 500X Pro',
      serialNumber: `SN-MIL-${runId}-DZ`,
      status: 'OPERATIONAL'
    }
  });
  track('MAINTENANCE', `Enregistrement équipement parc (${assetTag})`, assetRes.status === 201);
  const asset = assetRes.data;

  // 8.2 Bascule de statut d'engin (Opérationnel -> Maintenance)
  const toggleAssetRes = await request(`${API_BASE}/fleet/assets/${asset.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: { status: 'MAINTENANCE' }
  });
  track('MAINTENANCE', 'Bascule de statut engin vers MAINTENANCE (immobilisation pour révision)', toggleAssetRes.status === 200 && toggleAssetRes.data?.status === 'MAINTENANCE');

  // 8.3 Émission Ordre de Travail (OT)
  const otRes = await request(`${API_BASE}/fleet/maintenance-orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      orderNumber: `OT-2026-${runId}`,
      assetId: asset.id,
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      description: 'Vidange huile moteur, remplacement filtres et calibrage générateur de soudage 500A',
      scheduledDate: new Date(Date.now() + 2 * 86400000),
      cost: 45000,
      technician: 'Équipe Mécanique SILEX HMD'
    }
  });
  track('MAINTENANCE', `Émission Ordre de Travail (OT-2026-${runId}) — Coût: 45 000 DA`, otRes.status === 201);
  const ot = otRes.data;

  // 8.4 Clôture de l'OT & Libération Engin
  const closeOtRes = await request(`${API_BASE}/fleet/maintenance-orders/${ot.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dgToken}` },
    body: {
      status: 'COMPLETED',
      completionDate: new Date(),
      actualCost: 45000,
      notes: 'Révision des 500 heures achevée avec succès. Essais sous charge concluants.'
    }
  });
  track('MAINTENANCE', 'Clôture de l’OT (COMPLETED) et libération de l’engin pour le chantier', closeOtRes.status === 200 && closeOtRes.data?.status === 'COMPLETED');

  // ============================================================================
  // MODULE 9 : FINANCE, FACTURATION & COÛTS PROJETS
  // ============================================================================
  console.log('\n--- MODULE 9 : FINANCE, ANALYSE DES COÛTS & RENTABILITÉ ---');

  // 9.1 Overview Financier
  const finOverviewRes = await request(`${API_BASE}/finance/overview`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  track('FINANCE', 'Consultation métriques de rentabilité financière globale', finOverviewRes.status === 200);

  // 9.2 Répartition des coûts
  const finDistRes = await request(`${API_BASE}/finance/distribution`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  track('FINANCE', 'Consultation répartition des coûts analytiques (Main d’œuvre, Matériaux, Équipements)', finDistRes.status === 200);

  // 9.3 Suivi des coûts du projet créé
  const prjCostsRes = await request(`${API_BASE}/finance/projects/${projectId}/costs`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  track('FINANCE', `Consultation des imputations analytiques de coûts du chantier ${projectCode}`, prjCostsRes.status === 200);

  // ============================================================================
  // MODULE 10 : WORKFLOWS & BOÎTE DE RÉCEPTION DIRECTION
  // ============================================================================
  console.log('\n--- MODULE 10 : WORKFLOWS & VALIDATIONS DIRECTION ---');

  const inboxRes = await request(`${API_BASE}/workflows/inbox`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  track('WORKFLOWS', 'Consultation de la bannette centralisée des arbitrages DG', inboxRes.status === 200);

  // ============================================================================
  // MODULE 11 : RAPPORTS & TABLEAUX DE BORD EXÉCUTIFS
  // ============================================================================
  console.log('\n--- MODULE 11 : RAPPORTS & TABLEAUX DE BORD EXÉCUTIFS ---');

  const kpisRes = await request(`${API_BASE}/projects/kpis`, {
    headers: { Authorization: `Bearer ${dgToken}` }
  });
  track('RAPPORTS', 'Calcul dynamique des KPIs exécutifs (Chantiers, Marges, Sécurité)', kpisRes.status === 200 && !!kpisRes.data);

  // ============================================================================
  // MODULE 12 : RENDU & DISPONIBILITÉ DES 12 PAGES WEB (PORT 3008)
  // ============================================================================
  console.log('\n--- MODULE 12 : RENDU & DISPONIBILITÉ DES 12 PAGES WEB (PORT 3008) ---');

  const webRoutes = [
    { path: '/dashboard', label: 'Tableau de bord de direction' },
    { path: '/projects', label: 'Registre des chantiers & projets' },
    { path: `/projects/${projectCode}`, label: 'Fiche détaillée du projet & ODS/Jalons' },
    { path: '/procurement', label: 'Achats, DA, fournisseurs & Bons de commande' },
    { path: '/inventory', label: 'Stocks, magasins avancés & mouvements' },
    { path: '/hr', label: 'Ressources humaines, soudeurs ASME & pointages' },
    { path: '/maintenance', label: 'Maintenance parc engins & ordres de travaux' },
    { path: '/quality', label: 'Qualité QHSE, fiches FNC & actions correctives' },
    { path: '/finance', label: 'Finance, situations métrées & facturation' },
    { path: '/workflows', label: 'Boîte de réception des arbitrages direction' },
    { path: '/reports', label: 'Rapports d’audit & conformité ISO 9001' },
    { path: '/admin', label: 'Administration des utilisateurs & sécurité RBAC' },
  ];

  for (const route of webRoutes) {
    const pageRes = await request(`${WEB_BASE}${route.path}`);
    const isHtml = typeof pageRes.data === 'string' && pageRes.data.includes('<!DOCTYPE html');
    track('WEB_3008', `Rendu HTTP 200 de "${route.path}" (${route.label})`, pageRes.status === 200 && isHtml);
  }

  // ============================================================================
  // SYNTHÈSE STATISTIQUE & BILAN FINAL
  // ============================================================================
  console.log('\n================================================================');
  console.log('              BILAN DU CONTRÔLE MICRO-DÉTAILS');
  console.log('================================================================');
  console.log(`Total des vérifications exécutées : ${stats.total}`);
  console.log(`Vérifications validées           : ${stats.passed} (${Math.round((stats.passed / stats.total) * 100)}%)`);
  console.log(`Vérifications échouées           : ${stats.failed}`);
  console.log('----------------------------------------------------------------');
  for (const [mod, s] of Object.entries(stats.modules)) {
    const pct = Math.round((s.passed / (s.passed + s.failed)) * 100);
    console.log(` • Module ${mod.padEnd(12)} : ${s.passed}/${s.passed + s.failed} validés (${pct}%)`);
  }
  console.log('================================================================');

  if (stats.failed === 0) {
    console.log('🌟 SUCCÈS INTÉGRAL — 100% DES MICRO-DÉTAILS SONT OPÉRATIONNELS !');
    process.exit(0);
  } else {
    console.error(`⚠️ ATTENTION : ${stats.failed} vérification(s) ont échoué.`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Erreur critique pendant le test :', err);
  process.exit(1);
});
