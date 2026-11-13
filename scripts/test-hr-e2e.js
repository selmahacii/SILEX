const assert = require('assert');
const path = require('path');

async function run() {
  console.log('=== TEST E2E: MODULE 04 RESSOURCES HUMAINES & MOBILITÉ INDUSTRIELLE SARL SILEX SERVICES ===\n');

  let serverStore;
  try {
    const storeModule = require('../apps/web/src/lib/server-store');
    serverStore = storeModule.serverStore;
  } catch (err) {
    // Si exécuté via node CommonJS pur, importer de façon asynchrone le fichier TypeScript via tsx ou dynamic import
    try {
      const storeModule = await import('../apps/web/src/lib/server-store.ts');
      serverStore = storeModule.serverStore;
    } catch (e) {
      throw new Error(`Impossible de charger server-store: ${err.message} (fallback import: ${e.message})`);
    }
  }

  // ============================================================================
  // ÉTAPE 1 : CONTRÔLE DE SÉCURITÉ & VÉRIFICATION DE LA BASELINE FICTIVE (RH-01)
  // ============================================================================
  console.log('[1] Vérification de la baseline des 12 collaborateurs fictifs (DEMO)');
  const employees = await serverStore.getEmployees();
  assert.strictEqual(employees.length, 12, 'La baseline doit contenir exactement 12 collaborateurs de démonstration');

  // Vérification de sécurité stricte : matricules DEMO et identifiants
  employees.forEach(emp => {
    assert.ok(emp.id.startsWith('DEMO-EMP-'), `L'identifiant ${emp.id} doit débuter par DEMO-EMP-`);
    assert.ok(emp.matricule.startsWith('DEMO-MAT-'), `Le matricule ${emp.matricule} doit débuter par DEMO-MAT-`);
    assert.ok(emp.email.includes('.demo@'), `L'email ${emp.email} doit contenir .demo@ pour garantir qu'aucune donnée réelle n'est utilisée`);
    assert.ok(emp.phone.startsWith('+213 550 00 00'), `Le téléphone doit être un numéro fictif conventionnel`);
  });
  console.log('Sécurité validée : 100% des profils sont des entités de démonstration isolées.');

  const welder = employees.find(e => e.id === 'DEMO-EMP-002');
  assert.ok(welder, 'DEMO-EMP-002 (Soudeur TIG/ARC 6G) doit être présent');
  console.log(`Collaborateur vérifié: ${welder.name} (${welder.matricule}) - Fonction: ${welder.title}`);

  // ============================================================================
  // ÉTAPE 2 : QUALIFICATIONS DE SOUDAGE CQS & HABILITATIONS (RH-02)
  // ============================================================================
  console.log('\n[2] Vérification des qualifications de soudage CQS et des habilitations industrielles');
  const initialCerts = await serverStore.getIndustrialCertifications();
  assert.ok(initialCerts.length >= 5, 'Au moins 5 certifications spécialisées doivent être référencées');

  const cqsWelder = initialCerts.find(c => c.employeeId === 'DEMO-EMP-002');
  assert.ok(cqsWelder, 'Le soudeur DEMO-EMP-002 doit posséder un CQS');
  assert.strictEqual(cqsWelder.type, 'QUALIFICATION_SOUDAGE_CQS');
  assert.strictEqual(cqsWelder.status, 'VALIDE');
  assert.strictEqual(cqsWelder.weldingPosition, '6G fixe inclinée à 45°');
  assert.strictEqual(cqsWelder.issuingBody, 'Bureau Veritas Algérie SPA');
  console.log(`CQS validé: ${cqsWelder.certName} (${cqsWelder.certificateNumber}) - Norme: ${cqsWelder.weldingStandard} - Position: ${cqsWelder.weldingPosition}`);

  // ============================================================================
  // ÉTAPE 3 : WORKFLOW DE SOUMISSION & CONTRÔLE DOCUMENTAIRE CQS (RH-02)
  // ============================================================================
  console.log('\n[3] Soumission et audit documentaire d\'une nouvelle qualification');
  const newCqs = await serverStore.createIndustrialCertification({
    employeeId: 'DEMO-EMP-005',
    type: 'QUALIFICATION_SOUDAGE_CQS',
    certName: 'CQS Soudage Sous Flux Solide SAW (ASME IX)',
    certificateNumber: 'CQS-APAVE-2026-778',
    issuingBody: 'Apave Algérie',
    weldingStandard: 'ASME IX',
    weldingProcess: '121 (SAW automatique)',
    weldingPosition: '1G',
    baseMaterial: 'P1 Acier Carbone',
    dimensionRange: 'Épaisseur 10 à 50 mm',
  }, { name: 'Yacine Brahimi', role: 'SOUDEUR' });

  assert.strictEqual(newCqs.status, 'EN_ATTENTE_VERIFICATION', 'Le CQS soumis doit être en attente de vérification documentaire');
  console.log(`CQS soumis: ${newCqs.certificateNumber} - Statut initial: ${newCqs.status}`);

  // Audit documentaire par le Superviseur Qualité / HSE
  const auditedCqs = await serverStore.auditIndustrialCertification(newCqs.id, 'VALIDE', undefined, {
    name: 'Farid Zitouni',
    role: 'SUPERVISEUR_HSE'
  });
  assert.strictEqual(auditedCqs.status, 'VALIDE');
  assert.ok(auditedCqs.verifiedBy.includes('Farid Zitouni'));
  console.log(`CQS audité et validé: Statut=${auditedCqs.status}, Vérificateur=${auditedCqs.verifiedBy}`);

  // ============================================================================
  // ÉTAPE 4 : CYCLES DE ROTATION SUD 4x4 ET 6x2 (RH-12)
  // ============================================================================
  console.log('\n[4] Gestion des régimes de rotation chantiers (4x4 et 6x2)');
  const rotations = await serverStore.getRotationCycles();
  assert.strictEqual(rotations.length, 2, 'Deux cycles de rotation doivent être configurés');

  const rot4x4 = rotations.find(r => r.type === '4X4');
  assert.ok(rot4x4, 'Le régime 4x4 Sud doit exister');
  assert.strictEqual(rot4x4.workDays, 28);
  assert.strictEqual(rot4x4.restDays, 28);
  console.log(`Rotation vérifiée: ${rot4x4.rotationCode} (${rot4x4.siteName}) - Cycle: ${rot4x4.workDays}j travail / ${rot4x4.restDays}j repos`);

  // Affectation d'un collaborateur à la rotation Sud
  await serverStore.assignEmployeeToRotation(rot4x4.id, 'DEMO-EMP-007', { name: 'Responsable RH' });
  const updatedEmp7 = (await serverStore.getEmployees()).find(e => e.id === 'DEMO-EMP-007');
  assert.strictEqual(updatedEmp7.rotationCycle, '4X4');
  console.log(`Affectation réussie: ${updatedEmp7.name} rattaché au régime ${updatedEmp7.rotationCycle}`);

  // ============================================================================
  // ÉTAPE 5 : WORKFLOW DE CONGÉ & TITRE DE CONGÉ OFFICIEL A4 (RH-05)
  // ============================================================================
  console.log('\n[5] Circuit de demande de congé et émission du Titre de Congé A4');
  const leave = await serverStore.createLeaveRequest({
    employeeId: 'DEMO-EMP-002',
    title: 'Congé de récupération après arrêt technique Skikda',
    leaveType: 'RECUPERATION_ROTATION_SUD',
    startDate: '2026-11-20',
    endDate: '2026-12-03',
    durationDays: 14,
    reason: 'Récupération légale des 14 jours de repos après 6 semaines de chantier intensif',
  }, { name: 'Karim Mebarki', role: 'COLLABORATEUR' });

  assert.strictEqual(leave.status, 'SOUMIS');
  console.log(`Demande de congé émise: ${leave.reference} (${leave.durationDays} jours) - Statut: ${leave.status}`);

  // 1. Visa RH
  const leaveViseRH = await serverStore.approveLeaveRH(leave.id, { name: 'Khadidja Belhadj', role: 'RESPONSABLE_RH' });
  assert.strictEqual(leaveViseRH.status, 'VISE_RH');
  assert.ok(leaveViseRH.rhVisaSignature.startsWith('VISA-RH-'));
  console.log(`Visa RH apposé: ${leaveViseRH.rhVisaSignature}`);

  // 2. Accord Direction Générale & Génération Titre de Congé
  const leaveApprouveDG = await serverStore.approveLeaveDG(leave.id, { name: 'Directeur Général Silex', role: 'DIRECTION_GENERALE' });
  assert.strictEqual(leaveApprouveDG.status, 'ACCORDE_DG');
  assert.ok(leaveApprouveDG.certificateNumber.startsWith('TC-'));
  console.log(`Congé accordé par la DG: Statut=${leaveApprouveDG.status}, Titre de congé émis=${leaveApprouveDG.certificateNumber}`);

  const empAfterLeave = (await serverStore.getEmployees()).find(e => e.id === 'DEMO-EMP-002');
  assert.strictEqual(empAfterLeave.status, 'EN_CONGE');
  console.log(`Statut collaborateur mis à jour: ${empAfterLeave.status}`);

  // ============================================================================
  // ÉTAPE 6 : ORDRE DE MISSION & DÉPLACEMENT INDUSTRIEL (RH-06)
  // ============================================================================
  console.log('\n[6] Émission et validation d\'un Ordre de Mission sur chantier distant');
  const mission = await serverStore.createMissionOrder({
    employeeId: 'DEMO-EMP-004',
    title: 'Audit sécurité HSE & Épreuves hydrostatiques à Skikda',
    projectId: 'prj-2026-001',
    projectCode: 'PRJ-2026-001',
    destinationSite: 'Zone Industrielle Skikda RA1K',
    purpose: 'Supervision HSE des épreuves hydrauliques à 45 bars avec les inspecteurs Sonatrach',
    startDate: '2026-11-22',
    endDate: '2026-11-27',
    durationDays: 5,
    transportMode: 'VEHICULE_SERVICE',
    vehiclePlate: '04821-126-31',
    dailyAllowanceDA: 6500,
    advanceAmountDA: 35000,
  }, { name: 'Khadidja Belhadj', role: 'RESPONSABLE_RH' });

  assert.ok(mission.missionNumber.startsWith('MIS-'));
  assert.strictEqual(mission.status, 'VISE_RH');
  console.log(`Ordre de mission créé: ${mission.missionNumber} - Coût estimé: ${mission.totalEstimatedCostDA.toLocaleString()} DA`);

  // Approbation DG
  const approvedMission = await serverStore.approveMissionOrderDG(mission.id, { name: 'Directeur Général Silex', role: 'DIRECTION_GENERALE' });
  assert.strictEqual(approvedMission.status, 'APPROUVE_DG');
  assert.ok(approvedMission.dgVisaSignature.startsWith('VISA-DG-MIS-'));
  console.log(`Ordre de mission validé par la DG: Visa=${approvedMission.dgVisaSignature}`);

  const empAfterMission = (await serverStore.getEmployees()).find(e => e.id === 'DEMO-EMP-004');
  assert.strictEqual(empAfterMission.status, 'EN_MISSION');
  console.log(`Statut collaborateur mis à jour: ${empAfterMission.status}`);

  // ============================================================================
  // ÉTAPE 7 : BESOIN EN RECRUTEMENT / RENFORT CHANTIER (RH-07)
  // ============================================================================
  console.log('\n[7] Expression de besoin en recrutement émise depuis le chantier');
  const recruitment = await serverStore.createRecruitmentRequest({
    projectId: 'prj-2026-001',
    requestedRole: 'Tuyauteur Industriel Qualifié Isométrique',
    headcountNeeded: 4,
    contractType: 'CHANTIER',
    requiredQualifications: ['Lecture Isométrique ISO', 'Tracé & Découpe plasma', 'Habilitation hauteur'],
    startDate: '2026-12-01',
    durationMonths: 2,
    justification: 'Renfort équipe préfabrication pour le lot spools HP échangeurs E-102',
    priority: 'URGENTE',
  }, { name: 'Amine Khelifi', role: 'CHEF_PROJET' });

  assert.ok(recruitment.reference.startsWith('REC-'));
  assert.strictEqual(recruitment.status, 'SOUMIS');
  console.log(`Demande de recrutement émise: ${recruitment.reference} (${recruitment.headcountNeeded} postes de ${recruitment.requestedRole})`);

  // Validation DG
  const approvedRec = await serverStore.approveRecruitmentRequestDG(recruitment.id, { name: 'Directeur Général Silex', role: 'DIRECTION_GENERALE' });
  assert.strictEqual(approvedRec.status, 'APPROUVE_DG');
  console.log(`Recrutement approuvé par la DG: Statut=${approvedRec.status}`);

  // ============================================================================
  // ÉTAPE 8 : ARCHITECTURE DES RUBRIQUES & CONFORMITÉ RÉGLEMENTAIRE 2026 (RH-08)
  // ============================================================================
  console.log('\n[8] Vérification des rubriques salariales et des paramètres 2026');
  const rubrics = await serverStore.getSalaryRubrics();
  assert.ok(rubrics.length >= 10, 'Au moins 10 rubriques salariales paramétrées');

  const r100 = rubrics.find(r => r.code === 'R100');
  assert.ok(r100, 'Rubrique Salaire de Base (R100) doit exister');
  assert.ok(r100.regulatoryReference.includes('26-01'), 'La référence légale SNMG 2026 doit mentionner le décret 26-01');

  const r500 = rubrics.find(r => r.code === 'R500');
  assert.ok(r500, 'Rubrique CNAS Ouvrière (R500) doit exister');
  assert.ok(r500.baseFormula.includes('9.00%'), 'Le taux CNAS salarial doit être de 9.00%');
  assert.ok(r500.regulatoryReference.includes('15-236'), 'La référence décret 15-236 doit être présente');

  const r600 = rubrics.find(r => r.code === 'R600');
  assert.ok(r600, 'Rubrique IRG (R600) doit exister');
  console.log('Rubriques salariales vérifiées: SNMG 2026 (Décret 26-01), CNAS 9% (Décret 15-236), Barème progressif IRG.');

  // ============================================================================
  // ÉTAPE 9 : MOTEUR DE SIMULATION BULLETIN DE PAIE DÉMO (RH-08)
  // ============================================================================
  console.log('\n[9] Exécution du calcul du bulletin de paie démo (Simulation)');
  const payslip = await serverStore.calculatePayslipDemo('DEMO-EMP-003', {
    periodMonth: 11,
    periodYear: 2026,
    workedDays: 22,
    overtimeHours50: 10,
    overtimeHours100: 4,
  });

  assert.strictEqual(payslip.isDemoSimulation, true, 'Le bulletin doit être explicitement marqué isDemoSimulation: true');
  assert.ok(payslip.slipNumber.startsWith('BS-DEMO-'));
  assert.strictEqual(payslip.employeeMatricule, 'DEMO-MAT-003');
  assert.strictEqual(payslip.baseSalaryDA, 95000);

  // Vérification des calculs
  // Taux horaire = 95000 / 173.33 = 548.09 DA
  // IEP (8 ans x 1.5% = 12%) = 95000 x 0.12 = 11400 DA
  assert.strictEqual(payslip.iepAmountDA, 11400);

  // HS = (10 x 548.09 x 1.5) + (4 x 548.09 x 2.0) = 8221.35 + 4384.72 = 12606 DA
  assert.ok(payslip.overtimeAmountDA > 12000);

  // Assiette CNAS = 95000 + 11400 + 12606 + 12000 (nuisance) = 131006 DA
  // CNAS 9% = 131006 x 0.09 = 11791 DA
  assert.ok(payslip.cnasDeduction9Pct > 11500 && payslip.cnasDeduction9Pct < 12000);

  // Vérification que le net à payer est positif et cohérent
  assert.ok(payslip.netPayableDA > 90000);
  console.log(`Bulletin démo généré: N° ${payslip.slipNumber} (${payslip.employeeName})`);
  console.log(`- Salaire de Base: ${payslip.baseSalaryDA.toLocaleString()} DA`);
  console.log(`- IEP (Ancienneté): ${payslip.iepAmountDA.toLocaleString()} DA`);
  console.log(`- Heures Supplémentaires: ${payslip.overtimeAmountDA.toLocaleString()} DA`);
  console.log(`- Cotisation CNAS (9%): ${payslip.cnasDeduction9Pct.toLocaleString()} DA`);
  console.log(`- Retenue IRG calculée: ${payslip.irgTaxAmountDA.toLocaleString()} DA`);
  console.log(`- NET À PAYER (Simulation): ${payslip.netPayableDA.toLocaleString()} DA`);

  // ============================================================================
  // ÉTAPE 10 : CALCUL DYNAMIQUE DES KPIS RH (ZÉRO MOCKDATA)
  // ============================================================================
  console.log('\n[10] Calcul des indicateurs clés de performance RH en temps réel');
  const hrKpis = await serverStore.getHrKpis();
  console.log('KPIs RH calculés:', JSON.stringify(hrKpis, null, 2));

  assert.strictEqual(hrKpis.totalEmployees, 12);
  assert.ok(hrKpis.activeEmployees >= 10);
  assert.strictEqual(hrKpis.onMissionCount, 1);
  assert.strictEqual(hrKpis.onLeaveCount, 1);
  assert.ok(hrKpis.totalCertifications >= 6);
  assert.ok(hrKpis.certComplianceRate >= 80);

  // ============================================================================
  // ÉTAPE 11 : TEST NÉGATIF & ROBUSTESSE (Tentative approbation sans visa préalable)
  // ============================================================================
  console.log('\n[11] Test négatif de sécurité : Tentative d\'accord DG d\'un congé non visé par les RH');
  const unapprovedLeave = await serverStore.createLeaveRequest({
    employeeId: 'DEMO-EMP-001',
    title: 'Congé sans visa RH',
    startDate: '2026-12-10',
    endDate: '2026-12-15',
    durationDays: 5,
  });

  let errorCaught = false;
  try {
    await serverStore.approveLeaveDG(unapprovedLeave.id, { role: 'DIRECTION_GENERALE' });
  } catch (err) {
    errorCaught = true;
    console.log(`Sécurité SoD confirmée : "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'La DG ne peut pas approuver un congé sans visa RH préalable');

  console.log('\n========================================================================');
  console.log('✅ TEST E2E PHASE 5 VALIDÉ À 100% : LE MODULE RESSOURCES HUMAINES FONCTIONNE !');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('\n❌ ÉCHEC DU TEST E2E PHASE 5 :', err);
  process.exit(1);
});
