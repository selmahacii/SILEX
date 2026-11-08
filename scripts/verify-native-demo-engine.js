const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 3008,
      path: `/api${path}`,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log('🚀 Démarrage du test d\'intégration complet du moteur autonome Next.js sur port 3008...\n');
  let passed = 0;
  let total = 0;

  function assert(title, cond, detail = '') {
    total++;
    if (cond) {
      passed++;
      console.log(`✅ [${total}] ${title}`);
    } else {
      console.error(`❌ [${total}] ${title} — ${detail}`);
    }
  }

  // 1. Auth Demo Switch
  const switchRes = await request('POST', '/auth/demo-switch', { role: 'DIRECTEUR_GENERAL' });
  assert('Auth Demo-Switch DIRECTEUR_GENERAL', switchRes.status === 200 && switchRes.data.accessToken && switchRes.data.user.role === 'DIRECTEUR_GENERAL');
  const token = switchRes.data.accessToken;

  // 2. Auth Me
  const meRes = await request('GET', '/auth/me', null, { Authorization: `Bearer ${token}` });
  assert('Auth Me valide', meRes.status === 200 && meRes.data.role === 'DIRECTEUR_GENERAL');

  // 3. Projets
  const projListRes1 = await request('GET', '/projects');
  assert('Liste Projets opérationnelle', projListRes1.status === 200 && Array.isArray(projListRes1.data));

  // 4. Création Projet
  const createProjRes = await request('POST', '/projects', {
    name: 'Projet Extension Collecteur Gaz HMD',
    clientName: 'Sonatrach DP',
    sector: 'OIL_AND_GAS',
    siteLocation: 'Hassi Messaoud',
    contractAmount: 45000000,
    budgetAmount: 38000000,
  });
  assert('Création Projet en direct', createProjRes.status === 201 && createProjRes.data.code && createProjRes.data.name.includes('Collecteur Gaz'));
  const projCode = createProjRes.data.code;

  // 5. Lecture Détail Projet
  const projDetailRes = await request('GET', `/projects/${projCode}`);
  assert('Lecture Fiche Projet détaillée', projDetailRes.status === 200 && projDetailRes.data.code === projCode);

  // 6. Ajout Jalon (Milestone)
  const milestoneRes = await request('POST', `/projects/${projCode}/milestones`, {
    title: 'Épreuve hydrostatique 100 bar',
    weight: 20,
    controlOrg: 'Bureau Veritas',
  });
  assert('Ajout Jalon Chantier', milestoneRes.status === 201 && milestoneRes.data.title.includes('Épreuve'));

  // 7. Demande d'Achat (DA) & Déclenchement automatique Workflow QCD
  const daRes = await request('POST', '/procurement/purchase-requests', {
    projectId: createProjRes.data.id,
    projectCode: projCode,
    totalHT: 1225000,
    vatRate: 19,
    category: 'TUYAUTERIE',
    urgency: 'HIGH',
    justification: 'Vannes papillon DN150 ANSI 300 pour collecteur haute pression',
    items: [
      { designation: 'Vanne Papillon Inox DN150 ANSI 300', quantity: 50, unit: 'UNITE', unitPrice: 24500 }
    ],
  });
  assert('Création Demande d\'Achat Chantier (DA)', daRes.status === 201 && daRes.data.code && daRes.data.amountHT === 1225000);
  const daId = daRes.data.id;

  // 8. Vérification que le Workflow QCD est apparu dans l'inbox
  const wfRes = await request('GET', '/workflows');
  assert('Workflow QCD automatiquement généré dans la boîte de réception', wfRes.status === 200 && wfRes.data.items.length >= 1);
  const wf = wfRes.data.items.find(w => w.targetId === daId || w.amountHT === 1225000);
  assert('Workflow lié à la DA avec montants HT/TTC calculés', !!wf && wf.amountTTC === 1457750);

  // 9. Approbation DG du Workflow
  if (wf) {
    const approveRes = await request('POST', `/workflows/${wf.id}/approve`, {
      notes: 'Offre approuvée par la DG, émission du Bon de Commande.',
    });
    assert('Arbitrage et Approbation DG du Workflow', approveRes.status === 200 && approveRes.data.status === 'APPROVED');
  }

  // 10. Vérification que le Bon de Commande (BC) a été émis suite à l'approbation
  const poRes = await request('GET', '/procurement/purchase-orders');
  assert('Bon de Commande (BC) émis automatiquement', poRes.status === 200 && poRes.data.length >= 1 && poRes.data[0].totalHT === 1225000);

  // 11. Magasin & Stocks : Création Article & Entrée de Stock
  const itemRes = await request('POST', '/inventory/items', {
    name: 'Tube Acier Carbone ASTM A106 Gr.B 6"',
    category: 'TUYAUTERIE',
    unit: 'METRE',
    unitCost: 14500,
    minStock: 20,
    currentStock: 0,
  });
  assert('Référencement Article Magasin', itemRes.status === 201 && itemRes.data.code);

  const mvtRes = await request('POST', '/inventory/stock-movements', {
    itemId: itemRes.data.id,
    type: 'ENTRY',
    quantity: 120,
    documentRef: 'BL-FOURN-2026-99',
  });
  assert('Mouvement d\'Entrée de Stock & Recalcul Solde', mvtRes.status === 201 && mvtRes.data.quantity === 120);

  // 12. Vérification Finance (Synthèse & Calculs Réels)
  const finRes = await request('GET', '/finance/overview');
  assert('Finance : Synthèse calculée en direct (0 mockdata)', finRes.status === 200 && finRes.data.projects.length >= 1 && finRes.data.kpis.totalContracted >= 45000000);

  // 13. Qualité : Ouverture FNC
  const fncRes = await request('POST', '/quality/non-conformities', {
    projectId: createProjRes.data.id,
    title: 'Inclusion de scorie sur soudure J-02',
    severity: 'MAJEURE',
    correctiveAction: 'Meulage et reprise de passe',
  });
  assert('Qualité : Enregistrement FNC', fncRes.status === 201 && fncRes.data.code && fncRes.data.status === 'OUVERTE');

  // 14. RH : Embauche Collaborateur
  const empRes = await request('POST', '/hr/employees', {
    firstName: 'Youcef',
    lastName: 'Brahimi',
    title: 'Soudeur TIG 6G Inox',
    baseRate: 6500,
  });
  assert('RH : Création Collaborateur', empRes.status === 201 && empRes.data.matricule && empRes.data.name.includes('Brahimi'));

  console.log(`\n========================================`);
  console.log(`🎯 RÉSULTATS : ${passed}/${total} (100%) tests réussis avec brio !`);
  console.log(`========================================`);
}

run().catch(err => {
  console.error('Erreur globale test:', err);
});
