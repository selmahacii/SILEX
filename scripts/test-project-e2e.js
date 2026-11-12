const assert = require('assert');

async function run() {
  console.log('=== TEST E2E: MODULE 02 PROJETS INDUSTRIELS & CHANTIERS SARL SILEX SERVICES ===\n');

  const { serverStore } = require('../apps/web/src/lib/server-store');

  console.log('[1] Récupération du projet industriel issu du Module Commercial');
  const projects = await serverStore.getProjects();
  assert.ok(projects.length >= 1, 'Au moins un projet doit exister');
  const project = projects[0];
  console.log(`Projet identifié: ${project.code} — "${project.name}" (Client: ${project.clientName})`);
  assert.ok(project.code.startsWith('PRJ-'), 'Le code projet doit respecter la nomenclature PRJ-YYYY-NNN');
  assert.ok(project.contractAmount > 0, 'Le montant contractuel doit être positif');
  assert.ok(project.budgetAmount > 0, 'Le budget prévisionnel doit être positif');

  console.log('\n[2] Vérification des prestations contractuelles & calcul de l\'avancement physique pondéré');
  const contractItems = await serverStore.getContractItems(project.code);
  console.log(`Nombre de lots de prestations contractuelles: ${contractItems.length}`);
  assert.ok(contractItems.length >= 3, 'Au moins 3 prestations contractuelles doivent être définies');
  
  // Test updating quantity on contract item LOT-01
  const updatedItem = await serverStore.updateContractItem(project.code, contractItems[0].id, {
    validatedQty: 250, // 250 / 450 = 55.5%
    notes: 'Métré contradictoire contradictoirement approuvé par le bureau de contrôle',
  }, { id: 'usr-rp-001', name: 'Amine Khelifi (Resp. Projet)', role: 'RESPONSABLE_PROJET' });
  console.log(`Lot ${updatedItem.itemCode}: Quantité validée=${updatedItem.validatedQty}/${updatedItem.contractQty} ${updatedItem.unit} (Progression=${updatedItem.progress}%)`);
  assert.strictEqual(updatedItem.validatedQty, 250);

  const weightedProgress = await serverStore.recalculateWeightedPhysicalProgress(project.code);
  console.log(`Avancement physique pondéré recalculé du chantier: ${weightedProgress}%`);
  assert.ok(weightedProgress > 0 && weightedProgress <= 100);

  console.log('\n[3] Gestion du Planning et des Tâches Opérationnelles');
  const tasks = await serverStore.getProjectTasks(project.code);
  console.log(`Nombre de tâches initiales: ${tasks.length}`);
  assert.ok(tasks.length >= 5, 'Au moins 5 tâches de chantier doivent exister');

  // Création d'une nouvelle tâche critique
  const newTask = await serverStore.createProjectTask(project.code, {
    name: 'Remplacement joints spi & épreuve manométrique échangeur E-102',
    description: 'Pose de joints métalloplastiques et serrage au couple contrôlé.',
    team: 'Équipe Mécanique Spécialisée',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedHours: 48,
    priority: 'ELEVEE',
    status: 'EN_COURS',
    progress: 30,
    dependencies: ['TSK-04'],
    observations: 'Joints fournis par le magasin chantier.',
  }, { id: 'usr-chf-001', name: 'Karim Mansouri (Chef de Chantier)', role: 'CONDUCTEUR_TRAVAUX' });
  console.log(`Nouvelle tâche créée: ${newTask.code} — "${newTask.name}" (Statut: ${newTask.status}, ${newTask.progress}%)`);
  assert.ok(newTask.id);
  assert.strictEqual(newTask.status, 'EN_COURS');

  // Mise à jour de la tâche : passage à 100% et TERMINEE
  const completedTask = await serverStore.updateProjectTask(project.code, newTask.id, {
    progress: 100,
    actualHours: 44,
    observations: 'Épreuve manométrique concluante à 28 bars. Zéro fuite.',
  }, { id: 'usr-chf-001', name: 'Karim Mansouri', role: 'CONDUCTEUR_TRAVAUX' });
  console.log(`Tâche ${completedTask.code} achevée: Statut=${completedTask.status}, Progression=${completedTask.progress}%, Fin Réelle=${completedTask.actualEndDate}`);
  assert.strictEqual(completedTask.status, 'TERMINEE');
  assert.strictEqual(completedTask.progress, 100);
  assert.ok(completedTask.actualEndDate);

  console.log('\n[4] Détection automatique des retards sur tâches');
  // Création d'une tâche avec date de fin passée non terminée
  const delayedTask = await serverStore.createProjectTask(project.code, {
    name: 'Fourniture dossier des ouvrages exécutés (DOE)',
    description: 'Plans de récolement et fiches techniques certifiées.',
    plannedStartDate: '2026-10-01',
    plannedEndDate: '2026-10-15', // date passée
    priority: 'NORMALE',
    status: 'EN_COURS',
    progress: 40,
  });
  const allTasksWithDelay = await serverStore.getProjectTasks(project.code);
  const foundDelayed = allTasksWithDelay.find(t => t.id === delayedTask.id);
  console.log(`Tâche en retard détectée: ${foundDelayed.code} — isDelayed=${foundDelayed.isDelayed}`);
  assert.strictEqual(foundDelayed.isDelayed, true, 'Une tâche non achevée dont l\'échéance est passée doit être marquée isDelayed');

  console.log('\n[5] Rapport Journalier de Chantier (Daily Site Report) & Déduction Stock');
  const initialDailyReports = await serverStore.getDailyReports(project.code);
  console.log(`Rapports journaliers existants: ${initialDailyReports.length}`);
  assert.ok(initialDailyReports.length >= 1);

  const newDSR = await serverStore.createDailyReport(project.code, {
    date: new Date().toISOString().split('T')[0],
    weatherConditions: 'VENTEUX',
    siteCondition: 'Vent fort 40 km/h, travaux en hauteur suspendus 2h, report sur préfabrication atelier sol',
    manpower: [
      { trade: 'Chef de chantier', plannedCount: 1, presentCount: 1, hoursWorked: 10 },
      { trade: 'Superviseurs', plannedCount: 2, presentCount: 2, hoursWorked: 20 },
      { trade: 'Tuyauteurs', plannedCount: 8, presentCount: 8, hoursWorked: 72 },
      { trade: 'Soudeurs 6G', plannedCount: 6, presentCount: 5, hoursWorked: 45, notes: '1 absence médicale' },
      { trade: 'HSE', plannedCount: 1, presentCount: 1, hoursWorked: 10 },
    ],
    activities: [
      { designation: 'Préfabrication 6 coudes sch 80 et chanfreinage', plannedQty: 6, realizedQty: 6, unit: 'coude', workersCount: 4, hoursSpent: 28, observations: 'Conforme WMS' },
      { designation: 'Boulonnage brides collecteur principal', plannedQty: 8, realizedQty: 8, unit: 'assemblage', workersCount: 4, hoursSpent: 24, observations: 'Serrage dynamométrique OK' },
    ],
    equipmentUsed: [
      { equipmentName: 'Postes à souder Miller TIG/ARC', quantity: 5, hoursUsed: 8, condition: 'BON' },
      { equipmentName: 'Camion bras de levage 15T', quantity: 1, hoursUsed: 4, condition: 'BON' },
    ],
    materialsConsumed: [
      { itemId: 'art-001', designation: 'Tubes acier carbone A106 Gr B sch 80', quantity: 18, unit: 'ml', notes: 'Prélèvement casier B-14' },
      { itemId: 'art-002', designation: 'Électrodes E7018', quantity: 8, unit: 'kg', notes: 'Consommable étuvé' },
    ],
    incidents: [],
    generalObservations: 'Bonne réactivité des équipes face au coup de vent. Activités atelier optimisées.',
  }, { id: 'usr-chf-001', name: 'Karim Mansouri (Chef de Chantier)', role: 'CONDUCTEUR_TRAVAUX' });

  console.log(`Rapport journalier créé: N° ${newDSR.reportNumber} (Statut: ${newDSR.status})`);
  assert.strictEqual(newDSR.status, 'SOUMIS');
  assert.strictEqual(newDSR.manpower.length, 5);
  assert.strictEqual(newDSR.materialsConsumed.length, 2);

  // Validation du rapport journalier par le Responsable Projet
  const validatedDSR = await serverStore.validateDailyReport(project.code, newDSR.id, {
    id: 'usr-rp-001',
    name: 'Amine Khelifi (Resp. Projet)',
    role: 'RESPONSABLE_PROJET',
  });
  console.log(`Rapport journalier validé: Statut=${validatedDSR.status}, Visa=${validatedDSR.visaChantier}`);
  assert.strictEqual(validatedDSR.status, 'VALIDE');
  assert.ok(validatedDSR.visaChantier.startsWith('VISA-PROJET-'));

  console.log('\n[6] Rapport de Situation Périodique (RSP)');
  const newSituationReport = await serverStore.createSituationReport(project.code, {
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    plannedProgress: 50,
    criticalProcurementNeeds: 'Brides à collerette DN200 à approvisionner avant fin de mois',
    mobilizedHeadcount: 22,
    totalHoursWorked: 3520,
    generalAppraisal: 'Objectifs contractuels atteints avec 0 accident de travail et qualité de soudage conforme.',
  }, { id: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' });

  console.log(`Rapport de situation créé: N° ${newSituationReport.reportNumber}`);
  console.log(`- Avancement physique: ${newSituationReport.physicalStatus.actualProgress}% vs prévu ${newSituationReport.physicalStatus.plannedProgress}%`);
  console.log(`- Budget initial: ${newSituationReport.financialStatus.initialBudget.toLocaleString('fr-DZ')} DA`);
  console.log(`- Coûts consommés: ${newSituationReport.financialStatus.actualCost.toLocaleString('fr-DZ')} DA`);
  assert.strictEqual(newSituationReport.projectCode, project.code);
  assert.ok(newSituationReport.physicalStatus);
  assert.ok(newSituationReport.financialStatus);

  console.log('\n[7] Registre Centralisé des Contraintes et Difficultés');
  const constraints = await serverStore.getProjectConstraints(project.code);
  console.log(`Contraintes existantes: ${constraints.length}`);
  assert.ok(constraints.length >= 2);

  // Signalement d'une nouvelle contrainte
  const newConstraint = await serverStore.createProjectConstraint(project.code, {
    type: 'TECHNIQUE',
    description: 'Épaisseur résiduelle mesurée sur piquage échangeur inférieure à la côte mini constructive (4.2mm au lieu de 6mm).',
    impact: 'Nécessite remplacement immédiat du piquage avant épreuve hydraulique.',
    severity: 'ELEVEE',
    assignedToName: 'Nadia Chaib (QHSE)',
    correctiveAction: 'Découpe et soudage d\'une manchette de renfort neuve avec contrôle ultrasons.',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
  }, { id: 'usr-chf-001', name: 'Karim Mansouri', role: 'CONDUCTEUR_TRAVAUX' });
  console.log(`Nouvelle contrainte signalée: ${newConstraint.reference} (Type: ${newConstraint.type}, Gravité: ${newConstraint.severity}, Statut: ${newConstraint.status})`);
  assert.strictEqual(newConstraint.status, 'OUVERTE');

  // Résolution de la contrainte
  const resolvedConstraint = await serverStore.updateProjectConstraint(project.code, newConstraint.id, {
    status: 'RESOLUE',
    correctiveAction: 'Manchette posée et radiographiée conforme sans défaut selon ASME B31.3.',
  }, { id: 'usr-qhse-001', name: 'Nadia Chaib', role: 'RESPONSABLE_QUALITE' });
  console.log(`Contrainte ${resolvedConstraint.reference} résolue: Statut=${resolvedConstraint.status}, Date=${resolvedConstraint.resolvedDate}`);
  assert.strictEqual(resolvedConstraint.status, 'RESOLUE');
  assert.ok(resolvedConstraint.resolvedDate);

  console.log('\n[8] Événements Qualité et Sécurité HSE');
  const hseEvents = await serverStore.getHseIncidents(project.code);
  console.log(`Événements HSE enregistrés: ${hseEvents.length}`);
  assert.ok(hseEvents.length >= 2);

  const newHse = await serverStore.createHseIncident(project.code, {
    type: 'INSPECTION_HSE',
    severity: 'MINEURE',
    locationZone: 'Zone Unité 100 - Skid pompes P-101',
    description: 'Inspection hebdomadaire des équipements de levage et vérification de la trousse de premier secours.',
    immediateAction: 'Réapprovisionnement des pansements brûlures et contrôle de la validité de la fiole rince-œil.',
    correctiveAction: 'Audit mensuel programmé avec l\'infirmerie du site.',
    responsibleName: 'Nadia Chaib (QHSE)',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  }, { id: 'usr-qhse-001', name: 'Nadia Chaib', role: 'RESPONSABLE_QUALITE' });
  console.log(`Événement HSE créé: ${newHse.reference} (Type: ${newHse.type}, Statut: ${newHse.status})`);
  assert.strictEqual(newHse.status, 'OUVERT');

  console.log('\n[9] Interconnexion avec le Module Achats : Demande d\'achat émise depuis le chantier');
  const initialCommittedBudget = project.committedBudget || 0;
  const newPR = await serverStore.createProjectPurchaseRequest(project.code, {
    purpose: 'Achat d\'urgence de 8 brides à collerette DN200 PN40 acier carbone',
    neededDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    priority: 'URGENTE',
    totalEstimated: 640000, // 640 000 DZD
    lines: [
      { itemCode: 'BRIDE-DN200', designation: 'Bride à collerette acier A105 DN200 PN40', quantity: 8, unit: 'u', estimatedUnitPrice: 80000 }
    ]
  }, { id: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET' });

  console.log(`Demande d'achat émise: N° ${newPR.code} (Montant: ${newPR.totalEstimated.toLocaleString('fr-DZ')} DA)`);
  assert.ok(newPR.code.startsWith('DA-'));
  assert.strictEqual(newPR.projectCode, project.code);
  assert.strictEqual(project.committedBudget, initialCommittedBudget + 640000, 'Le budget engagé du projet doit être incrémenté');

  console.log('\n[10] Interconnexion avec le Module Stock : Sortie de stock sur chantier');
  const initialSpentBudget = project.spentBudget || 0;
  const stockMvt = await serverStore.recordProjectStockConsumption(project.code, {
    itemId: 'art-001',
    quantity: 10,
    unit: 'ml',
    unitPrice: 20000, // 200 000 DZD
    reason: 'Prélèvement complémentaire pour spool retour vapeur',
  }, { id: 'usr-mag-001', name: 'Tarek Meziani (Magasinier)', role: 'RESPONSABLE_MAGASIN' });

  console.log(`Mouvement de stock créé: N° ${stockMvt.movementNumber} (${stockMvt.quantity} ${stockMvt.unit} -> ${stockMvt.destinationSite})`);
  assert.ok(stockMvt.movementNumber.startsWith('SM-'));
  assert.strictEqual(stockMvt.type, 'SORTIE_CHANTIER');
  assert.strictEqual(project.spentBudget, initialSpentBudget + 200000, 'Le budget dépensé du projet doit être incrémenté de la valeur sortie');

  console.log('\n[11] Vérification de l\'état final et de l\'intégrité des données');
  const refreshedProject = await serverStore.getProject(project.code);
  console.log(`Chantier: ${refreshedProject.code}`);
  console.log(`- Avancement physique pondéré: ${refreshedProject.physicalProgress}%`);
  console.log(`- Tâches actives: ${refreshedProject.tasks.length}`);
  console.log(`- Rapports journaliers validés: ${refreshedProject.dailyReports.filter(r => r.status === 'VALIDE').length}`);
  console.log(`- Contraintes suivies: ${refreshedProject.constraints.length}`);
  console.log(`- Budget alloué: ${refreshedProject.budgetAmount.toLocaleString('fr-DZ')} DA`);
  console.log(`- Coûts engagés: ${refreshedProject.committedBudget.toLocaleString('fr-DZ')} DA`);
  console.log(`- Coûts consommés: ${refreshedProject.spentBudget.toLocaleString('fr-DZ')} DA`);
  assert.ok(refreshedProject.tasks.length >= 6);
  assert.ok(refreshedProject.dailyReports.length >= 2);
  assert.ok(refreshedProject.constraints.length >= 3);

  console.log('\n========================================================================');
  console.log('✅ TEST E2E PHASE 3 VALIDÉ À 100% : LE MODULE PROJET INDUSTRIEL FONCTIONNE !');
  console.log('========================================================================');
}

run().catch(err => {
  console.error('❌ ÉCHEC DU TEST E2E PROJET:', err);
  process.exit(1);
});
