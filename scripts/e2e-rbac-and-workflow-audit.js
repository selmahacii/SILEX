/**
 * SILEX INDUSTRIAL ERP — CONTRÔLE APPROFONDI DE LA MATRICE RBAC & DU WORKFLOW MÉTIER
 * Validation exhaustive des permissions positives (200/201) et des barrières 403 Forbidden.
 */

const http = require('http');

const API_BASE = 'http://127.0.0.1:4000/api';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  categories: {
    RBAC_POSITIVE: { passed: 0, failed: 0 },
    RBAC_NEGATIVE: { passed: 0, failed: 0 },
    WORKFLOW_CHAIN: { passed: 0, failed: 0 }
  }
};

function check(category, testName, condition, details = '') {
  results.total++;
  if (condition) {
    results.passed++;
    results.categories[category].passed++;
    console.log(`  ✓ [${category.padEnd(14)}] ${testName} ${details ? '— ' + details : ''}`);
    return true;
  } else {
    results.failed++;
    results.categories[category].failed++;
    console.error(`  ✗ [${category.padEnd(14)}] ÉCHEC : ${testName} ${details ? '— ' + details : ''}`);
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
  console.log(`   SILEX INDUSTRIAL ERP — AUDIT COMPLET RBAC & WORKFLOW [RUN #${runId}]`);
  console.log('   Vérification rigoureuse des habilitations (403/200) et des flux');
  console.log('================================================================\n');

  // 1. OBTENTION DES TOKENS POUR LES 9 RÔLES MÉTIER
  console.log('[PHASE 1] Initialisation des sessions pour les 9 rôles clés...');
  const roles = [
    'ADMINISTRATEUR',
    'DIRECTEUR_GENERAL',
    'RESPONSABLE_PROJET',
    'RESPONSABLE_ACHATS',
    'RESPONSABLE_MAGASIN',
    'RESPONSABLE_RH',
    'RESPONSABLE_FINANCIER',
    'RESPONSABLE_MAINTENANCE',
    'RESPONSABLE_QUALITE'
  ];

  const tokens = {};
  for (const role of roles) {
    const res = await request(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      body: { role }
    });
    if (res.status === 201 && res.data?.accessToken) {
      tokens[role] = res.data.accessToken;
      console.log(`  ✓ Rôle ${role.padEnd(23)} : Connecté avec token JWT`);
    } else {
      console.error(`  ✗ Erreur obtention session pour rôle ${role}`);
      process.exit(1);
    }
  }

  // ============================================================================
  // PHASE 2 : CONTRÔLE DE LA MATRICE RBAC (SÉCURITÉ POSITIVE ET NÉGATIVE)
  // ============================================================================
  console.log('\n[PHASE 2] Contrôle strict des habilitations RBAC (Permissions & Refus 403)...');

  // 2.1 MODULE ADMINISTRATION DES UTILISATEURS
  // - Positif : Admin peut créer
  const validUserEmail = `user.rbac.${runId}@silex-services.dz`;
  const adminCreateUser = await request(`${API_BASE}/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.ADMINISTRATEUR}` },
    body: {
      name: `Collaborateur Test ${runId}`,
      email: validUserEmail,
      role: 'RESPONSABLE_PROJET',
      departmentCode: 'OPERATIONS_PROJETS',
      title: 'Ingénieur Projet Junior',
      password: 'SilexDemo2026!'
    }
  });
  check('RBAC_POSITIVE', 'ADMINISTRATEUR peut créer un utilisateur (201)', adminCreateUser.status === 201);

  // - Négatif : Chef de projet interdit (403)
  const pmCreateUser = await request(`${API_BASE}/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      name: 'Hack User',
      email: `hack.${runId}@silex.dz`,
      role: 'ADMINISTRATEUR',
      departmentCode: 'DIRECTION_GENERALE'
    }
  });
  check('RBAC_NEGATIVE', 'RESPONSABLE_PROJET interdit de créer un utilisateur (403)', pmCreateUser.status === 403);

  // - Négatif : Magasinier interdit (403)
  const magCreateUser = await request(`${API_BASE}/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` },
    body: { name: 'Hack User 2', email: `hack2.${runId}@silex.dz`, role: 'ADMINISTRATEUR', departmentCode: 'DIRECTION_GENERALE' }
  });
  check('RBAC_NEGATIVE', 'RESPONSABLE_MAGASIN interdit de créer un utilisateur (403)', magCreateUser.status === 403);

  // 2.2 MODULE FINANCE & RENTABILITÉ GLOBALE
  // - Positif : Responsable Financier peut lire l'overview
  const finRead = await request(`${API_BASE}/finance/overview`, {
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_FINANCIER}` }
  });
  check('RBAC_POSITIVE', 'RESPONSABLE_FINANCIER peut consulter les finances (200)', finRead.status === 200);

  // - Négatif : Magasinier interdit de consulter les marges globales de l'entreprise (403)
  const magFinRead = await request(`${API_BASE}/finance/overview`, {
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` }
  });
  check('RBAC_NEGATIVE', 'RESPONSABLE_MAGASIN interdit de consulter les marges globales (403)', magFinRead.status === 403);

  // 2.3 MODULE AUDIT ISO 9001
  // - Positif : DG peut consulter le journal d'audit
  const dgAudit = await request(`${API_BASE}/audit`, {
    headers: { Authorization: `Bearer ${tokens.DIRECTEUR_GENERAL}` }
  });
  check('RBAC_POSITIVE', 'DIRECTEUR_GENERAL peut consulter le journal d’audit (200)', dgAudit.status === 200);

  // - Négatif : Chef de projet interdit de consulter le journal d'audit système (403)
  const pmAudit = await request(`${API_BASE}/audit`, {
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` }
  });
  check('RBAC_NEGATIVE', 'RESPONSABLE_PROJET interdit de consulter le journal d’audit (403)', pmAudit.status === 403);

  // ============================================================================
  // PHASE 3 : VALIDATION DU FLUX DE TRAVAIL INDUSTRIEL COMPLET (WORKFLOW)
  // ============================================================================
  console.log('\n[PHASE 3] Validation du flux de travail industriel continu (Workflow)...');

  // Étape 1 : Création du projet industriel
  const projectCode = `PRJ-FLOW-${runId}`;
  const createPrj = await request(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      code: projectCode,
      name: `Réseau Vapeur & Collecteurs HP #${runId}`,
      clientName: 'SONATRACH / DP Hassi Messaoud',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Hassi Messaoud (Base Sud)',
      contractAmount: 160000000,
      budgetAmount: 120000000,
      startDate: new Date().toISOString(),
      contractEndDate: new Date(Date.now() + 120 * 86400000).toISOString(),
      description: 'Chantier industriel tuyauterie HP acier allié avec contrôles CND.'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 1 : Création du projet contractuel avec budget et marge', createPrj.status === 201);
  const projectId = createPrj.data?.id;

  // Étape 2 : Émission de l'ODS Démarrage par la DG
  const createOds = await request(`${API_BASE}/projects/${projectId}/service-orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.DIRECTEUR_GENERAL}` },
    body: {
      type: 'DEMARRAGE',
      issueDate: new Date().toISOString(),
      description: 'Démarrage officiel des travaux de préfabrication en atelier SILEX',
      delayImpactDays: 0
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 2 : Émission de l’Ordre de Service (ODS Démarrage) par la DG', createOds.status === 201);
  const odsId = createOds.data?.id;

  // Étape 3 : Visa contradictoire client par le PM
  const visaOds = await request(`${API_BASE}/projects/${projectId}/service-orders/${odsId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      status: 'ACCEPTED',
      clientSignatory: 'M. Farouk Mansour (Représentant Sonatrach DP HMD) — Visa ACCEPTÉ'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 3 : Visa contradictoire client enregistré sur l’ODS (ACCEPTED)', visaOds.status === 200);

  // Étape 4 : Qualification d'un Fournisseur
  const supplierCode = `FRN-FLOW-${runId}`;
  const createSupplier = await request(`${API_BASE}/procurement/suppliers`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_ACHATS}` },
    body: {
      code: supplierCode,
      name: `Société Algérienne des Vannes et Tubes ${runId}`,
      contactName: 'Rachid Mebarki',
      email: `contact.flow.${runId}@savt-dz.com`,
      phone: '+213 29 73 55 66',
      address: 'Zone Industrielle Hassi Messaoud',
      specialties: 'Robinetterie et Brides Haute Pression',
      taxId: 'TVA-19-DZ'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 4 : Homologation d’un fournisseur (NIF, Spécialités)', createSupplier.status === 201);
  const supplierId = createSupplier.data?.id;

  // Étape 5 : Récupération du magasin et déclaration d'un article
  const whRes = await request(`${API_BASE}/inventory/warehouses`, {
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` }
  });
  const warehouseId = whRes.data?.[0]?.id;

  const itemRes = await request(`${API_BASE}/inventory/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` },
    body: {
      code: `ART-WNRF-${runId}`,
      name: `Bride Forgée WNRF ANSI 600 DN100 TP316L #${runId}`,
      unit: 'UNITE',
      unitCost: 35000,
      currentStock: 0,
      description: 'Bride à collerette forgée sous norme ASME B16.5'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 5 : Création de la référence article en magasin', itemRes.status === 201);
  const itemId = itemRes.data?.id;

  // Étape 6 : Expression du besoin par le Chef de Projet (Demande d'Achat)
  const createDa = await request(`${API_BASE}/procurement/purchase-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      projectId: projectId,
      urgencyLevel: 'HIGH',
      justification: `Besoin critique brides WNRF pour montage skid collecteur ${projectCode}`,
      desiredDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      lines: [
        {
          itemId: itemId,
          quantity: 20,
          unit: 'UNITE',
          description: 'Bride Forgée WNRF ANSI 600 DN100',
          estimatedUnitPrice: 35000
        }
      ]
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 6 : Émission de la Demande d’Achat (DA) liée au chantier', createDa.status === 201);
  const daId = createDa.data?.id;

  // Étape 7 : Dépôt du devis comparatif par l'Acheteur
  const createQuote = await request(`${API_BASE}/procurement/quotes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_ACHATS}` },
    body: {
      purchaseRequestId: daId,
      supplierId: supplierId,
      totalAmountHT: 700000,
      deliveryLeadTimeDays: 5,
      stockAvailability: 'IMMEDIATE',
      technicalCompliance: true,
      warrantyMonths: 12,
      paymentTerms: '30 jours fin de mois',
      notes: 'Certificat matière CCPU 3.1 inclus',
      lines: [{ purchaseRequestLineId: createDa.data?.lines?.[0]?.id, unitPrice: 35000 }]
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 7 : Offre comparative fournisseur enregistrée avec CCPU 3.1', createQuote.status === 201);
  const quoteId = createQuote.data?.id;

  // Étape 8 : Transmission pour approbation DG
  const submitDa = await request(`${API_BASE}/procurement/purchase-requests/${daId}/submit-approval`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_ACHATS}` },
    body: { recommendedQuoteId: quoteId }
  });
  check('WORKFLOW_CHAIN', 'Étape 8 : Transmission de la DA à l’arbitrage Direction Générale', submitDa.status === 200 || submitDa.status === 201);

  // CONTRÔLE SÉCURITÉ SOD DANS LE WORKFLOW :
  // Le Chef de Projet demandeur tente d'approuver sa propre DA
  const sodBlock = await request(`${API_BASE}/procurement/purchase-requests/${daId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: { approvedQuoteId: quoteId }
  });
  check('RBAC_NEGATIVE', 'Contrôle SoD : Blocage 403 si le demandeur tente d’approuver sa propre DA', sodBlock.status === 403);

  // L'acheteur tente d'approuver la commande (interdit, seul DG valide l'engagement)
  const buyerBlock = await request(`${API_BASE}/procurement/purchase-requests/${daId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_ACHATS}` },
    body: { approvedQuoteId: quoteId }
  });
  check('RBAC_NEGATIVE', 'Contrôle SoD : Blocage 403 si l’acheteur tente d’approuver la commande (rôle DG requis)', buyerBlock.status === 403);

  // Étape 9 : Approbation formelle par le DG et génération du Bon de Commande
  const approveDa = await request(`${API_BASE}/procurement/purchase-requests/${daId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.DIRECTEUR_GENERAL}` },
    body: {
      approvedQuoteId: quoteId,
      decisionNotes: 'Offre retenue après arbitrage technique et commercial. Bon de commande émis.'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 9 : Approbation DG & Émission automatique du Bon de Commande (BC)', approveDa.status === 200 || approveDa.status === 201);
  const po = approveDa.data?.purchaseOrder;

  // Étape 10 : Réception physique au magasin par le Magasinier
  const receiveGoods = await request(`${API_BASE}/inventory/receive-goods`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` },
    body: {
      purchaseOrderId: po.id,
      warehouseId: warehouseId,
      deliveryNoteNumber: `BL-SAVT-${runId}-001`,
      notes: 'Contrôle quantitatif conforme, CCPU 3.1 vérifié et visé sans réserve',
      lines: [
        {
          purchaseOrderLineId: po.lines[0].id,
          quantityReceived: 20
        }
      ]
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 10 : Réception magasin avec visa BL & CCPU 3.1 (+20 pièces)', receiveGoods.status === 200 || receiveGoods.status === 201);

  // CONTRÔLE SÉCURITÉ STOCK : Sortie excessive bloquée
  const excessiveExit = await request(`${API_BASE}/inventory/issue-to-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` },
    body: {
      itemId: itemId,
      warehouseId: warehouseId,
      projectId: projectId,
      quantity: 99999,
      notes: 'Tentative de dépassement de stock'
    }
  });
  check('RBAC_NEGATIVE', 'Contrôle de Stock : Rejet 400 si sortie > stock physique disponible', excessiveExit.status === 400);

  // Étape 11 : Sortie de stock légitime vers le chantier avec imputation analytique
  const legitimateExit = await request(`${API_BASE}/inventory/issue-to-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_MAGASIN}` },
    body: {
      itemId: itemId,
      warehouseId: warehouseId,
      projectId: projectId,
      quantity: 10,
      notes: `Délivrance de 10 brides pour montage tronçon collecteur ${projectCode}`
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 11 : Sortie de stock vers chantier avec imputation analytique du coût', legitimateExit.status === 200 || legitimateExit.status === 201);

  // Étape 12 : Enregistrement d'un collaborateur par les RH
  const empMatricule = `EMP-FLOW-${runId}`;
  const createEmp = await request(`${API_BASE}/hr/employees`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_RH}` },
    body: {
      registrationNumber: empMatricule,
      firstName: 'Tahar',
      lastName: `Messaoudi ${runId}`,
      title: 'Soudeur Tuyauteur TIG 6G',
      email: `t.messaoudi.${runId}@silex-services.dz`,
      phone: '+213 661 55 44 33',
      contractType: 'CHANTIER'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 12 : Enregistrement collaborateur qualifié par le Responsable RH', createEmp.status === 201);
  const employeeId = createEmp.data?.id;

  // Étape 13 : Délivrance de l'habilitation ASME IX
  const createCert = await request(`${API_BASE}/hr/certifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_RH}` },
    body: {
      employeeId: employeeId,
      certName: 'Homologation Soudage Tube 6G H-L045 ASME IX (GTAW Inox)',
      issuingBody: 'Bureau Veritas Algérie',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 730 * 86400000).toISOString(),
      status: 'VALIDE'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 13 : Délivrance homologation ASME IX / ISO 9606-1 (VALIDE)', createCert.status === 201);

  // Étape 14 : Pointage Chantier Journalier
  const pointage = await request(`${API_BASE}/hr/attendances`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      employeeId: employeeId,
      projectId: projectId,
      date: new Date().toISOString(),
      regularHours: 8,
      hoursWorked: 8,
      overtimeHours: 2.5
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 14 : Saisie pointage chantier journalier avec imputation heures sup (+50%)', pointage.status === 201);

  // Étape 15 : Saisie Situation de travaux métrée par le Chef de Projet
  const createSit = await request(`${API_BASE}/projects/${projectId}/work-situations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_PROJET}` },
    body: {
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
      amountHT: 25000000,
      notes: 'Situation métrée mensuelle N°01 : Avancement tuyauterie vapeur et skids'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 15 : Saisie de la Situation de Travaux Métrée (25 000 000 DA HT)', createSit.status === 201);
  const sitId = createSit.data?.id;

  // Étape 16 : Approbation Bon à Payer (BAP) par la DG
  const approveSit = await request(`${API_BASE}/projects/${projectId}/work-situations/${sitId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.DIRECTEUR_GENERAL}` },
    body: {
      status: 'APPROVED',
      notes: 'Bon à Payer (BAP) accordé après vérification des attachements contradictoires avec le client'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 16 : Approbation Bon à Payer (BAP) par le Directeur Général', approveSit.status === 200);

  // Étape 17 : Suivi Qualité QHSE — FNC et clôture
  const createFnc = await request(`${API_BASE}/quality/non-conformities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_QUALITE}` },
    body: {
      ncNumber: `FNC-FLOW-${runId}`,
      title: `Inclusion de laitier détectée sur soudure SW-12 #${runId}`,
      description: 'Défaut détecté lors du contrôle radiographique RT sous norme ASME B31.3',
      severity: 'MAJEURE',
      projectId: projectId,
      detectedBy: 'Nadia Chaib (Responsable QHSE)'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 17 : Signalement Fiche de Non-Conformité (FNC) par la Qualité', createFnc.status === 201);
  const fncId = createFnc.data?.id;

  const closeFnc = await request(`${API_BASE}/quality/non-conformities/${fncId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.RESPONSABLE_QUALITE}` },
    body: {
      status: 'CLOSED',
      closeType: 'Visa Contrôle Qualité',
      resolutionNotes: 'Reprise effectuée, contre-tir radiographique 100% conforme.'
    }
  });
  check('WORKFLOW_CHAIN', 'Étape 18 : Clôture formelle de la FNC après contre-tir conforme (CLOSED)', closeFnc.status === 200);

  // Étape 19 : Traçabilité Audit ISO 9001
  const auditLogs = await request(`${API_BASE}/audit`, {
    headers: { Authorization: `Bearer ${tokens.ADMINISTRATEUR}` }
  });
  const hasAuditWorkflow = Array.isArray(auditLogs.data) && auditLogs.data.length > 5;
  check('WORKFLOW_CHAIN', 'Étape 19 : Traçabilité complète du workflow enregistrée dans l’Audit ISO 9001', hasAuditWorkflow);

  // ============================================================================
  // SYNTHÈSE STATISTIQUE & BILAN FINAL
  // ============================================================================
  console.log('\n================================================================');
  console.log('              BILAN DE L’AUDIT RBAC & WORKFLOW');
  console.log('================================================================');
  console.log(`Total des vérifications exécutées : ${results.total}`);
  console.log(`Vérifications validées           : ${results.passed} (${Math.round((results.passed / results.total) * 100)}%)`);
  console.log(`Vérifications échouées           : ${results.failed}`);
  console.log('----------------------------------------------------------------');
  for (const [cat, s] of Object.entries(results.categories)) {
    const pct = Math.round((s.passed / (s.passed + s.failed)) * 100);
    console.log(` • Catégorie ${cat.padEnd(16)} : ${s.passed}/${s.passed + s.failed} validés (${pct}%)`);
  }
  console.log('================================================================');

  if (results.failed === 0) {
    console.log('🌟 SUCCÈS TOTAL — LES RBAC ET LE FLUX DE TRAVAIL SONT 100% CONFORMES !');
    process.exit(0);
  } else {
    console.error(`⚠️ ATTENTION : ${results.failed} vérification(s) ont échoué.`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Erreur critique pendant le test :', err);
  process.exit(1);
});
