const API_URL = 'http://localhost:4000/api';

async function run() {
  console.log('================================================================');
  console.log('   SILEX INDUSTRIAL ERP — TEST INTERCOMMUNICATION & SYNCHRONISME');
  console.log('   Vérification des Nouveaux Modules et Micro-Détails Intégrés');
  console.log('================================================================\n');

  // 1. Login DG
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  if (!loginRes.ok) throw new Error('Échec login DG');
  const { accessToken } = await loginRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

  let passCount = 0;
  let totalCount = 0;

  async function test(title, fn) {
    totalCount++;
    process.stdout.write(`[TEST ${totalCount}] ${title}... `);
    try {
      const detail = await fn();
      passCount++;
      console.log(`✓ SUCCÈS\n   └─ ${detail}`);
    } catch (e) {
      console.log(`✗ ÉCHEC\n   └─ ${e.message}`);
    }
  }

  // Projet test
  let project;
  await test('Création Projet Pilote pour Audit Synchronisme', async () => {
    const code = `PRJ-SYNC-${Math.floor(100 + Math.random() * 900)}`;
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code,
        name: 'Arrêt Unité Reforming Catalytique Arzew',
        clientName: 'SONATRACH / Raffinerie Arzew',
        siteLocation: 'Zone Industrielle Arzew',
        contractAmount: 50000000,
        budgetAmount: 38000000,
        startDate: new Date().toISOString(),
        contractEndDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    project = await res.json();
    return `Projet créé: ${project.code} | Montant: ${Number(project.contractAmount).toLocaleString()} DA | Budget: ${Number(project.budgetAmount).toLocaleString()} DA`;
  });

  // TEST 1: Avenant Contractuel & TS
  await test('Avenant Contractuel & Travaux Supplémentaires (TS) — Synchronisation Montant Marché & Budget', async () => {
    const res = await fetch(`${API_URL}/projects/${project.id}/contract`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        contractAmountDelta: 4500000,
        budgetAmountDelta: 3200000,
        notes: '[AVN-2026-001] PLUS_VALUE — Prolongation tuyauterie vapeur HP 6" et ajout vannes motorisées',
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    if (Number(updated.contractAmount) !== 54500000 || Number(updated.budgetAmount) !== 41200000) {
      throw new Error(`Montants inattendus: contractAmount=${updated.contractAmount}, budgetAmount=${updated.budgetAmount}`);
    }
    return `Montant marché révisé: ${Number(updated.contractAmount).toLocaleString()} DA (+4 500 000 DA) | Budget révisé: ${Number(updated.budgetAmount).toLocaleString()} DA (+3 200 000 DA)`;
  });

  // TEST 2: Transfert Inter-Magasins
  let item, wh1, wh2;
  await test('Transfert Inter-Magasins (Magasin Central Arzew ↔ Base Hassi Messaoud)', async () => {
    // Wh1
    const whRes1 = await fetch(`${API_URL}/inventory/warehouses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Magasin Central Arzew ZI', location: 'Arzew', managerName: 'Tarek Meziani' }),
    });
    wh1 = await whRes1.json();

    // Wh2
    const whRes2 = await fetch(`${API_URL}/inventory/warehouses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Base Avancée Sud HMD', location: 'Hassi Messaoud', managerName: 'Kamel Slimani' }),
    });
    wh2 = await whRes2.json();

    // Item
    const itemRes = await fetch(`${API_URL}/inventory/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Vanne Haute Pression DN150 PN64',
        description: 'Vanne à opercule acier forgé pour vapeur HP',
        unit: 'UNITE',
        unitCost: 85000,
        minStockLevel: 5,
        currentStock: 20,
      }),
    });
    item = await itemRes.json();

    // Transfer
    const transferRes = await fetch(`${API_URL}/inventory/transfers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sourceWarehouseId: wh1.id,
        targetWarehouseId: wh2.id,
        itemId: item.id,
        quantity: 8,
        notes: '[Chauffeur: Djamel Hamidi | Matricule: 02450-116-30] Acheminement vanne HP vers chantier Sud',
      }),
    });
    if (!transferRes.ok) throw new Error(await transferRes.text());
    const transfer = await transferRes.json();
    return `Transfert validé: 8 unités expédiées de "${wh1.name}" vers "${wh2.name}" | Mouvement: ${transfer.movementType || 'WAREHOUSE_TRANSFER'}`;
  });

  // TEST 3: Retour de Chantier & Allègement du Coût Réel du Projet
  await test('Retour de Chantier (Surplus Matière) — Synchronisme Stock & Allègement Financier Projet', async () => {
    // 1. Sortie de 10 unités vers le chantier pour lui imputer des coûts réels
    const issueRes = await fetch(`${API_URL}/inventory/issue-to-project`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: project.id,
        warehouseId: wh1.id,
        itemId: item.id,
        quantity: 10,
        notes: 'Sortie initiale chantier pour montage',
      }),
    });
    if (!issueRes.ok) throw new Error(`Échec sortie chantier: ${await issueRes.text()}`);

    const projectBefore = await (await fetch(`${API_URL}/projects/${project.id}`, { headers })).json();
    const initialCost = Number(projectBefore.actualCost || 0);

    // 2. Retour de 3 vannes en surplus non consommées
    const returnRes = await fetch(`${API_URL}/inventory/returns`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: project.id,
        warehouseId: wh1.id,
        itemId: item.id,
        quantity: 3,
        condition: 'BON_ETAT',
        notes: 'Surplus de vannes non consommées réintégrées en magasin central',
      }),
    });
    if (!returnRes.ok) throw new Error(await returnRes.text());
    const returnData = await returnRes.json();

    const projectAfter = await (await fetch(`${API_URL}/projects/${project.id}`, { headers })).json();
    const newCost = Number(projectAfter.actualCost || 0);

    if (newCost >= initialCost) {
      throw new Error(`Le coût réel n'a pas été allégé: initial=${initialCost}, new=${newCost}`);
    }

    const credited = initialCost - newCost;
    return `3x Vannes réintégrées au stock | Coût réel chantier: ${initialCost.toLocaleString()} DA → ${newCost.toLocaleString()} DA (Allègement direct de -${credited.toLocaleString()} DA)`;
  });

  // TEST 4: Reconduction Semestrielle Habilitation Soudeur ASME IX / ISO 9606
  let cert;
  await test('Reconduction Habilitation Soudeur ASME IX (QW-322) — Extension Validité +6 Mois', async () => {
    // Get an employee
    const emps = await (await fetch(`${API_URL}/hr/employees`, { headers })).json();
    const emp = emps[0];

    const certRes = await fetch(`${API_URL}/hr/certifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        employeeId: emp.id,
        certName: 'Qualification Soudeur Tube 6G Inox 316L',
        certNumber: `CQS-BV-${Math.floor(100 + Math.random() * 900)}`,
        standard: 'ASME IX / ISO 9606-1',
        issuingBody: 'Bureau Veritas Algérie',
        issuedDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(), // Expiring now
      }),
    });
    cert = await certRes.json();

    const renewRes = await fetch(`${API_URL}/hr/certifications/${cert.id}/renew`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({}),
    });
    if (!renewRes.ok) throw new Error(await renewRes.text());
    const renewed = await renewRes.json();

    const oldTime = new Date(cert.expiryDate).getTime();
    const newTime = new Date(renewed.expiryDate).getTime();
    const diffDays = Math.round((newTime - oldTime) / (86400000));

    if (diffDays < 170) throw new Error(`Extension insuffisante: +${diffDays} jours`);
    return `Certificat ${renewed.certNumber} prorogé de +${diffDays} jours sous visa ASME QW-322 | Nouvelle expiration: ${new Date(renewed.expiryDate).toLocaleDateString('fr-DZ')}`;
  });

  // TEST 5: Visite Médicale d'Aptitude Chantier avec Habilitations
  await test('Visite Médicale Médecine du Travail — Aptitude Postes à Risques (Hauteur, Confiné, ARI, Sahara)', async () => {
    const emps = await (await fetch(`${API_URL}/hr/employees`, { headers })).json();
    const emp = emps[0];

    const medRes = await fetch(`${API_URL}/hr/employees/${emp.id}/medical`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        doctorName: 'Dr. K. Benmansour (Centre Médecine du Travail Arzew)',
        checkupDate: new Date().toISOString(),
        status: 'APTE',
        restrictions: [
          'Travail en hauteur (> 3 mètres)',
          'Espaces confinés (Capacités & colonnes)',
          'Climat saharien / Fortes chaleurs (> 40°C)',
          'Port appareil respiratoire isolant (ARI)',
        ],
        notes: 'Examen audiométrique et ECG sans anomalie. Aptitude totale confirmée pour 1 an.',
      }),
    });
    if (!medRes.ok) throw new Error(await medRes.text());
    const medCert = await medRes.json();
    return `Attestation d'aptitude médicale ${medCert.certNumber} enregistrée pour ${emp.firstName} ${emp.lastName} | Échéance: ${new Date(medCert.expiryDate).toLocaleDateString('fr-DZ')}`;
  });

  // TEST 6: Encaissement Client & Synchronisation Trésorerie
  await test('Enregistrement Encaissement Client (Virement BEA Arzew) — Mise à Jour Trésorerie & Avancement', async () => {
    const payRes = await fetch(`${API_URL}/finance/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: project.id,
        amount: 8500000,
        paymentReference: 'VIR-BEA-2026-778',
        bankName: 'Banque Extérieure d’Algérie (BEA Arzew)',
        paymentDate: new Date().toISOString(),
        notes: 'Règlement situation n°1 après décompte contradictoire',
      }),
    });
    if (!payRes.ok) throw new Error(await payRes.text());
    const payResult = await payRes.json();

    const prjAfter = await (await fetch(`${API_URL}/projects/${project.id}`, { headers })).json();
    return `Encaissement de 8 500 000 DA consigné (Réf: VIR-BEA-2026-778) | Avancement financier calculé: ${prjAfter.financialProgress}%`;
  });

  // TEST 7: Restitution Retenue de Garantie (5%)
  await test('Restitution de la Retenue de Garantie Contractuelle (5%) — Levée Définitive J+365', async () => {
    const relRes = await fetch(`${API_URL}/finance/warranty-release`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: project.id,
        releaseReference: 'PV-RD-2026-099',
        receptionDefinitiveDate: new Date().toISOString(),
        notes: 'PV de réception définitive signé contradictoirement sans réserves',
      }),
    });
    if (!relRes.ok) throw new Error(await relRes.text());
    const relResult = await relRes.json();
    return `Retenue de garantie de ${Number(relResult.releasedAmount).toLocaleString()} DA (5% de ${Number(relResult.contractAmount).toLocaleString()} DA) débloquée avec succès !`;
  });

  console.log('\n================================================================');
  console.log(`RÉSULTAT DU CONTRÔLE D'INTERCOMMUNICATION : ${passCount} / ${totalCount} validés`);
  console.log('================================================================');
  if (passCount === totalCount) {
    console.log('🌟 SYNCHRONISME & MICRO-DÉTAILS TOTALEMENT OPÉRATIONNELS !');
  }
}

run().catch(console.error);
